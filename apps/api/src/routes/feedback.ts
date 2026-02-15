import { Router, Request, Response } from "express";
import pool from "../db.js";
import { authRequired, teacherOnly } from "../middleware/auth.js";

const router: Router = Router();

// GET /api/feedback/course/:courseId — get feedback for a course
router.get("/course/:courseId", authRequired, async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const feedbackResult = await pool.query(
      `SELECT f.*, c.title AS course_title, u.name AS teacher_name
       FROM feedback f
       JOIN courses c ON c.id = f.course_id
       JOIN users u ON u.id = f.teacher_id
       WHERE f.course_id = $1
       ORDER BY f.created_at DESC
       LIMIT 1`,
      [courseId],
    );

    if (feedbackResult.rows.length === 0) {
      res.json(null);
      return;
    }

    const feedback = feedbackResult.rows[0];

    // Get action items
    const actionsResult = await pool.query(
      `SELECT id, title, due_label, pending
       FROM feedback_actions
       WHERE feedback_id = $1
       ORDER BY id`,
      [feedback.id],
    );

    res.json({
      ...feedback,
      actions: actionsResult.rows,
    });
  } catch (err) {
    console.error("Failed to get feedback:", err);
    res.status(500).json({ error: "获取反馈失败" });
  }
});

// POST /api/feedback — save feedback draft (teacher)
router.post("/", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.userId;
    const { course_id, summary, quote, requirements, assignment_title, due_date, actions } = req.body;

    if (!course_id) {
      res.status(400).json({ error: "课程ID必填" });
      return;
    }

    // Verify teacher owns course
    const course = await pool.query("SELECT teacher_id FROM courses WHERE id = $1", [course_id]);
    if (course.rows.length === 0 || course.rows[0].teacher_id !== teacherId) {
      res.status(403).json({ error: "无权操作此课程" });
      return;
    }

    // Upsert feedback (one per course, latest)
    const existing = await pool.query(
      "SELECT id FROM feedback WHERE course_id = $1 AND teacher_id = $2 ORDER BY created_at DESC LIMIT 1",
      [course_id, teacherId],
    );

    let feedbackId: string;
    if (existing.rows.length > 0) {
      feedbackId = existing.rows[0].id;
      await pool.query(
        `UPDATE feedback SET summary = $1, quote = $2, requirements = $3, assignment_title = $4, due_date = $5, updated_at = NOW()
         WHERE id = $6`,
        [summary || null, quote || null, requirements || [], assignment_title || null, due_date || null, feedbackId],
      );
    } else {
      const result = await pool.query(
        `INSERT INTO feedback (course_id, teacher_id, summary, quote, requirements, assignment_title, due_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [course_id, teacherId, summary || null, quote || null, requirements || [], assignment_title || null, due_date || null],
      );
      feedbackId = result.rows[0].id;
    }

    // Replace action items
    if (actions && Array.isArray(actions)) {
      await pool.query("DELETE FROM feedback_actions WHERE feedback_id = $1", [feedbackId]);
      for (const action of actions) {
        await pool.query(
          `INSERT INTO feedback_actions (feedback_id, title, due_label, pending)
           VALUES ($1, $2, $3, $4)`,
          [feedbackId, action.title, action.due_label || null, action.pending !== false],
        );
      }
    }

    // Return full feedback
    const full = await pool.query("SELECT * FROM feedback WHERE id = $1", [feedbackId]);
    const actionsResult = await pool.query("SELECT * FROM feedback_actions WHERE feedback_id = $1", [feedbackId]);

    res.json({ ...full.rows[0], actions: actionsResult.rows });
  } catch (err) {
    console.error("Failed to save feedback:", err);
    res.status(500).json({ error: "保存反馈失败" });
  }
});

// PATCH /api/feedback/:id/publish — publish feedback
router.patch("/:id/publish", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.userId;
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE feedback SET published = true, updated_at = NOW()
       WHERE id = $1 AND teacher_id = $2
       RETURNING *`,
      [id, teacherId],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: "反馈不存在" });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Failed to publish feedback:", err);
    res.status(500).json({ error: "发布反馈失败" });
  }
});

export default router;
