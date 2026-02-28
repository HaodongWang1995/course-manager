import { Router, Request, Response } from "express";
import pool from "../db.js";
import { authRequired, teacherOnly } from "../middleware/auth.js";

const router: Router = Router();

// GET /api/teachers/students — students enrolled in teacher's courses
router.get("/students", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.userId;
    const result = await pool.query(
      `SELECT DISTINCT u.id, u.name, u.email, u.avatar,
              array_agg(DISTINCT c.title) AS courses,
              COUNT(DISTINCT e.course_id) AS course_count
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       JOIN courses c ON c.id = e.course_id
       WHERE c.teacher_id = $1 AND e.status IN ('approved', 'pending')
       GROUP BY u.id, u.name, u.email, u.avatar
       ORDER BY u.name`,
      [teacherId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Failed to list teacher students:", err);
    res.status(500).json({ error: "获取学生列表失败" });
  }
});

// GET /api/teachers/students/:studentId — student detail for teacher
router.get("/students/:studentId", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.userId;
    const { studentId } = req.params;

    // Get student basic info + enrollments in this teacher's courses
    const studentResult = await pool.query(
      `SELECT u.id, u.name, u.email, u.avatar, u.created_at
       FROM users u WHERE u.id = $1 AND u.role = 'student'`,
      [studentId],
    );
    if (studentResult.rows.length === 0) {
      res.status(404).json({ error: "学生不存在" });
      return;
    }

    const enrollmentsResult = await pool.query(
      `SELECT e.id AS enrollment_id, e.course_id, c.title AS course_title,
              e.status, e.created_at
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.student_id = $1 AND c.teacher_id = $2
       ORDER BY e.created_at DESC`,
      [studentId, teacherId],
    );

    res.json({
      ...studentResult.rows[0],
      enrollments: enrollmentsResult.rows,
    });
  } catch (err) {
    console.error("Failed to get student detail:", err);
    res.status(500).json({ error: "获取学生详情失败" });
  }
});

// GET /api/teachers/schedule — today's schedules for teacher's courses
router.get("/schedule", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.userId;
    const result = await pool.query(
      `SELECT cs.id, cs.course_id, cs.lesson_number, cs.title, cs.start_time, cs.end_time, cs.room,
              c.title AS course_title,
              (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'approved') AS student_count
       FROM course_schedules cs
       JOIN courses c ON c.id = cs.course_id
       WHERE c.teacher_id = $1
       ORDER BY cs.start_time`,
      [teacherId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Failed to list teacher schedule:", err);
    res.status(500).json({ error: "获取日程失败" });
  }
});

// GET /api/teachers/stats — KPI statistics
router.get("/stats", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.userId;
    const stats = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM courses WHERE teacher_id = $1) AS course_count,
        (SELECT COUNT(*) FROM courses WHERE teacher_id = $1 AND status = 'active') AS active_courses,
        (SELECT COUNT(DISTINCT e.student_id) FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE c.teacher_id = $1 AND e.status = 'approved') AS student_count,
        (SELECT COUNT(*) FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE c.teacher_id = $1 AND e.status = 'pending') AS pending_enrollments,
        (SELECT COUNT(*) FROM course_schedules cs JOIN courses c ON c.id = cs.course_id WHERE c.teacher_id = $1) AS schedule_count`,
      [teacherId],
    );
    res.json(stats.rows[0]);
  } catch (err) {
    console.error("Failed to get teacher stats:", err);
    res.status(500).json({ error: "获取统计数据失败" });
  }
});

// GET /api/teachers/deadlines
router.get("/deadlines", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.userId;
    const result = await pool.query(
      `SELECT id, title, due_date, urgent, created_at
       FROM deadlines
       WHERE teacher_id = $1
       ORDER BY due_date ASC`,
      [teacherId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Failed to list deadlines:", err);
    res.status(500).json({ error: "获取待办失败" });
  }
});

// POST /api/teachers/deadlines
router.post("/deadlines", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.userId;
    const { title, due_date, urgent } = req.body;
    if (!title || !due_date) {
      res.status(400).json({ error: "标题和截止时间必填" });
      return;
    }
    const result = await pool.query(
      `INSERT INTO deadlines (teacher_id, title, due_date, urgent)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [teacherId, title, due_date, urgent || false],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Failed to create deadline:", err);
    res.status(500).json({ error: "创建待办失败" });
  }
});

// DELETE /api/teachers/deadlines/:id
router.delete("/deadlines/:id", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.userId;
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM deadlines WHERE id = $1 AND teacher_id = $2 RETURNING id`,
      [id, teacherId],
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: "待办不存在" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete deadline:", err);
    res.status(500).json({ error: "删除待办失败" });
  }
});

export default router;
