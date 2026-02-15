import { Router, Request, Response } from "express";
import pool from "../db.js";
import { authRequired, teacherOnly } from "../middleware/auth.js";

const router: Router = Router();

// GET /api/courses/:courseId/assignments — list assignments for a course
router.get("/courses/:courseId/assignments", authRequired, async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const result = await pool.query(
      `SELECT a.*, c.title AS course_title
       FROM assignments a
       JOIN courses c ON c.id = a.course_id
       WHERE a.course_id = $1
       ORDER BY a.due_date ASC`,
      [courseId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Failed to list assignments:", err);
    res.status(500).json({ error: "获取作业列表失败" });
  }
});

// POST /api/courses/:courseId/assignments — create assignment (teacher)
router.post("/courses/:courseId/assignments", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.user!.userId;

    // Verify ownership
    const course = await pool.query("SELECT teacher_id FROM courses WHERE id = $1", [courseId]);
    if (course.rows.length === 0) {
      res.status(404).json({ error: "课程不存在" });
      return;
    }
    if (course.rows[0].teacher_id !== teacherId) {
      res.status(403).json({ error: "无权操作此课程" });
      return;
    }

    const { title, description, due_date } = req.body;
    if (!title || !due_date) {
      res.status(400).json({ error: "标题和截止时间必填" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO assignments (course_id, title, description, due_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [courseId, title, description || null, due_date],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Failed to create assignment:", err);
    res.status(500).json({ error: "创建作业失败" });
  }
});

// GET /api/students/assignments — all assignments for student's enrolled courses
router.get("/students/assignments", authRequired, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await pool.query(
      `SELECT a.id, a.title, a.description, a.due_date, a.course_id,
              c.title AS course_title,
              COALESCE(s.status, 'pending') AS submission_status,
              s.submitted_at
       FROM assignments a
       JOIN courses c ON c.id = a.course_id
       JOIN enrollments e ON e.course_id = a.course_id AND e.student_id = $1 AND e.status = 'approved'
       LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.student_id = $1
       ORDER BY a.due_date ASC`,
      [studentId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Failed to list student assignments:", err);
    res.status(500).json({ error: "获取作业列表失败" });
  }
});

// PATCH /api/assignments/:id/submit — submit/update assignment status (student)
router.patch("/assignments/:id/submit", authRequired, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["submitted", "late"].includes(status)) {
      res.status(400).json({ error: "状态无效" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO assignment_submissions (assignment_id, student_id, status, submitted_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (assignment_id, student_id)
       DO UPDATE SET status = $3, submitted_at = NOW()
       RETURNING *`,
      [id, studentId, status],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Failed to submit assignment:", err);
    res.status(500).json({ error: "提交作业失败" });
  }
});

export default router;
