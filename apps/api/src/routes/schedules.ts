import { Router, Request, Response } from "express";
import pool from "../db.js";
import { authRequired, teacherOnly } from "../middleware/auth.js";

const router: Router = Router();

router.use(authRequired);

// GET /api/courses/:courseId/schedules
router.get("/courses/:courseId/schedules", async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const result = await pool.query(
      "SELECT * FROM course_schedules WHERE course_id = $1 ORDER BY lesson_number",
      [courseId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("List schedules error:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// POST /api/courses/:courseId/schedules - Add schedule (teacher only)
router.post("/courses/:courseId/schedules", teacherOnly, async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { lesson_number, title, start_time, end_time, room } = req.body;

    // Verify course ownership
    const course = await pool.query(
      "SELECT teacher_id FROM courses WHERE id = $1",
      [courseId]
    );
    if (course.rows.length === 0) {
      res.status(404).json({ error: "课程不存在" });
      return;
    }
    if (course.rows[0].teacher_id !== req.user!.userId) {
      res.status(403).json({ error: "无权修改此课程" });
      return;
    }

    if (!start_time || !end_time) {
      res.status(400).json({ error: "请填写上课时间" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO course_schedules (course_id, lesson_number, title, start_time, end_time, room)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [courseId, lesson_number || 1, title || null, start_time, end_time, room || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create schedule error:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// PUT /api/schedules/:id - Update schedule (teacher only)
router.put("/schedules/:id", teacherOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { lesson_number, title, start_time, end_time, room } = req.body;

    // Verify ownership via course
    const schedule = await pool.query(
      `SELECT cs.*, c.teacher_id FROM course_schedules cs
       JOIN courses c ON cs.course_id = c.id
       WHERE cs.id = $1`,
      [id]
    );
    if (schedule.rows.length === 0) {
      res.status(404).json({ error: "课时不存在" });
      return;
    }
    if (schedule.rows[0].teacher_id !== req.user!.userId) {
      res.status(403).json({ error: "无权修改此课时" });
      return;
    }

    const result = await pool.query(
      `UPDATE course_schedules SET
        lesson_number = COALESCE($1, lesson_number),
        title = COALESCE($2, title),
        start_time = COALESCE($3, start_time),
        end_time = COALESCE($4, end_time),
        room = COALESCE($5, room)
       WHERE id = $6
       RETURNING *`,
      [lesson_number, title, start_time, end_time, room, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update schedule error:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// DELETE /api/schedules/:id - Delete schedule (teacher only)
router.delete("/schedules/:id", teacherOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const schedule = await pool.query(
      `SELECT cs.*, c.teacher_id FROM course_schedules cs
       JOIN courses c ON cs.course_id = c.id
       WHERE cs.id = $1`,
      [id]
    );
    if (schedule.rows.length === 0) {
      res.status(404).json({ error: "课时不存在" });
      return;
    }
    if (schedule.rows[0].teacher_id !== req.user!.userId) {
      res.status(403).json({ error: "无权删除此课时" });
      return;
    }

    await pool.query("DELETE FROM course_schedules WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete schedule error:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

export default router;
