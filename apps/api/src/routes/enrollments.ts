import { Router, Request, Response } from "express";
import pool from "../db.js";
import { authRequired, teacherOnly } from "../middleware/auth.js";

const router: Router = Router();

router.use(authRequired);

// POST /api/enrollments - Student applies for a course
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.user!;

    if (role !== "student") {
      res.status(403).json({ error: "仅学生可报名" });
      return;
    }

    const { course_id, note } = req.body;
    if (!course_id) {
      res.status(400).json({ error: "课程ID不能为空" });
      return;
    }

    // Check course exists and is active
    const courseResult = await pool.query(
      "SELECT id, status FROM courses WHERE id = $1",
      [course_id]
    );
    if (courseResult.rows.length === 0) {
      res.status(404).json({ error: "课程不存在" });
      return;
    }
    if (courseResult.rows[0].status !== "active") {
      res.status(400).json({ error: "该课程未开放报名" });
      return;
    }

    // Check duplicate
    const dupResult = await pool.query(
      "SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2",
      [userId, course_id]
    );
    if (dupResult.rows.length > 0) {
      res.status(409).json({ error: "已报名该课程" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO enrollments (student_id, course_id, note)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, course_id, note || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create enrollment error:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// GET /api/enrollments - Student lists own enrollments
router.get("/", async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;
    const { status } = req.query;

    let query = `
      SELECT e.*, c.title as course_title, u.name as teacher_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON c.teacher_id = u.id
      WHERE e.student_id = $1
    `;
    const params: unknown[] = [userId];

    if (status) {
      query += ` AND e.status = $2`;
      params.push(status);
    }

    query += " ORDER BY e.created_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("List enrollments error:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// GET /api/enrollments/course/:courseId - Teacher lists course enrollments
router.get("/course/:courseId", teacherOnly, async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;
    const { courseId } = req.params;
    const { status } = req.query;

    // Verify course ownership
    const courseResult = await pool.query(
      "SELECT id, teacher_id FROM courses WHERE id = $1",
      [courseId]
    );
    if (courseResult.rows.length === 0) {
      res.status(404).json({ error: "课程不存在" });
      return;
    }
    if (courseResult.rows[0].teacher_id !== userId) {
      res.status(403).json({ error: "无权查看此课程的报名" });
      return;
    }

    let query = `
      SELECT e.*, u.name as student_name, u.email as student_email
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      WHERE e.course_id = $1
    `;
    const params: unknown[] = [courseId];

    if (status) {
      query += ` AND e.status = $2`;
      params.push(status);
    }

    query += " ORDER BY e.created_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("List course enrollments error:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// PATCH /api/enrollments/:id/review - Teacher approves/rejects
router.patch("/:id/review", teacherOnly, async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;
    const { id } = req.params;
    const { status, reject_reason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      res.status(400).json({ error: "状态值无效，仅支持 approved 或 rejected" });
      return;
    }

    // Find enrollment with course ownership check
    const enrollResult = await pool.query(
      `SELECT e.id, e.status, e.course_id, c.teacher_id
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.id = $1`,
      [id]
    );
    if (enrollResult.rows.length === 0) {
      res.status(404).json({ error: "报名记录不存在" });
      return;
    }

    const enrollment = enrollResult.rows[0];
    if (enrollment.teacher_id !== userId) {
      res.status(403).json({ error: "无权审核此报名" });
      return;
    }
    if (enrollment.status !== "pending") {
      res.status(400).json({ error: "该报名已被处理" });
      return;
    }

    const result = await pool.query(
      `UPDATE enrollments SET status = $1, reject_reason = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, status === "rejected" ? (reject_reason || null) : null, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Review enrollment error:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// DELETE /api/enrollments/:id - Student cancels enrollment
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;
    const { id } = req.params;

    const enrollResult = await pool.query(
      "SELECT id, student_id, status FROM enrollments WHERE id = $1",
      [id]
    );
    if (enrollResult.rows.length === 0) {
      res.status(404).json({ error: "报名记录不存在" });
      return;
    }

    const enrollment = enrollResult.rows[0];
    if (enrollment.student_id !== userId) {
      res.status(403).json({ error: "无权取消此报名" });
      return;
    }
    if (enrollment.status !== "pending") {
      res.status(400).json({ error: "仅可取消待审核的报名" });
      return;
    }

    await pool.query("DELETE FROM enrollments WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Cancel enrollment error:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

export default router;
