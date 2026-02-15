import { Router, Request, Response } from "express";
import pool from "../db.js";
import { authRequired, teacherOnly } from "../middleware/auth.js";

const router: Router = Router();

// GET /api/courses/:courseId/resources — list resources for a course
router.get("/courses/:courseId/resources", authRequired, async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const result = await pool.query(
      `SELECT r.*, c.title AS course_title
       FROM resources r
       JOIN courses c ON c.id = r.course_id
       WHERE r.course_id = $1
       ORDER BY r.created_at DESC`,
      [courseId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Failed to list resources:", err);
    res.status(500).json({ error: "获取资源列表失败" });
  }
});

// POST /api/courses/:courseId/resources — add resource (teacher)
router.post("/courses/:courseId/resources", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.user!.userId;

    const course = await pool.query("SELECT teacher_id FROM courses WHERE id = $1", [courseId]);
    if (course.rows.length === 0) {
      res.status(404).json({ error: "课程不存在" });
      return;
    }
    if (course.rows[0].teacher_id !== teacherId) {
      res.status(403).json({ error: "无权操作此课程" });
      return;
    }

    const { title, file_type, file_size, featured } = req.body;
    if (!title) {
      res.status(400).json({ error: "标题必填" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO resources (course_id, title, file_type, file_size, featured)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [courseId, title, file_type || null, file_size || null, featured || false],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Failed to create resource:", err);
    res.status(500).json({ error: "创建资源失败" });
  }
});

// GET /api/students/resources — all resources for student's enrolled courses
router.get("/students/resources", authRequired, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await pool.query(
      `SELECT r.id, r.title, r.file_type, r.file_size, r.featured, r.created_at,
              c.title AS course_title
       FROM resources r
       JOIN courses c ON c.id = r.course_id
       JOIN enrollments e ON e.course_id = r.course_id AND e.student_id = $1 AND e.status = 'approved'
       ORDER BY r.featured DESC, r.created_at DESC`,
      [studentId],
    );

    const featured = result.rows.filter((r) => r.featured);
    const all = result.rows.filter((r) => !r.featured);

    res.json({ featured, all });
  } catch (err) {
    console.error("Failed to list student resources:", err);
    res.status(500).json({ error: "获取资源失败" });
  }
});

export default router;
