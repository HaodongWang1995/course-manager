import { Router, Request, Response } from "express";
import pool from "../db.js";
import { attachUser, authRequired, teacherOnly } from "../middleware/auth.js";

const router: Router = Router();

// GET /api/courses - List courses
router.get("/", attachUser, async (req: Request, res: Response) => {
  try {
    const role = req.user?.role;
    const userId = req.user?.userId;
    const { search, category, status } = req.query;

    let query: string;
    let params: unknown[];

    if (role === "teacher" && userId) {
      // Teachers see their own courses
      query = `
        SELECT c.*, u.name as teacher_name,
          (SELECT COUNT(*) FROM course_schedules cs WHERE cs.course_id = c.id) as lesson_count
        FROM courses c
        JOIN users u ON c.teacher_id = u.id
        WHERE c.teacher_id = $1
      `;
      params = [userId];
    } else {
      // Students or public users see all active courses
      query = `
        SELECT c.*, u.name as teacher_name,
          (SELECT COUNT(*) FROM course_schedules cs WHERE cs.course_id = c.id) as lesson_count
        FROM courses c
        JOIN users u ON c.teacher_id = u.id
        WHERE c.status = 'active'
      `;
      params = [];
    }

    if (search) {
      const paramIdx = params.length + 1;
      query += ` AND (c.title ILIKE $${paramIdx} OR c.description ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
    }

    if (category && category !== "all") {
      const paramIdx = params.length + 1;
      query += ` AND c.category = $${paramIdx}`;
      params.push(category);
    }

    if (status && status !== "all" && role === "teacher") {
      const paramIdx = params.length + 1;
      query += ` AND c.status = $${paramIdx}`;
      params.push(status);
    }

    query += " ORDER BY c.created_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("List courses error:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// GET /api/courses/:id - Course detail
router.get("/:id", attachUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const courseResult = await pool.query(
      `SELECT c.*, u.name as teacher_name
       FROM courses c
       JOIN users u ON c.teacher_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (courseResult.rows.length === 0) {
      res.status(404).json({ error: "课程不存在" });
      return;
    }

    const course = courseResult.rows[0];

    // Check access: teachers can only see their own, students/public can see active
    if (req.user?.role === "teacher" && course.teacher_id !== req.user!.userId) {
      res.status(403).json({ error: "无权访问此课程" });
      return;
    }
    if (req.user?.role !== "teacher" && course.status !== "active") {
      res.status(403).json({ error: "此课程不可用" });
      return;
    }

    // Get schedules
    const schedulesResult = await pool.query(
      "SELECT * FROM course_schedules WHERE course_id = $1 ORDER BY lesson_number",
      [id]
    );

    res.json({ ...course, schedules: schedulesResult.rows });
  } catch (err) {
    console.error("Get course error:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// POST /api/courses - Create course (teacher only)
router.post("/", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const { title, description, price, cover_image, category, status } = req.body;

    if (!title) {
      res.status(400).json({ error: "课程标题不能为空" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO courses (teacher_id, title, description, price, cover_image, category, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user!.userId,
        title,
        description || null,
        price || 0,
        cover_image || null,
        category || null,
        status || "active",
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create course error:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// PUT /api/courses/:id - Update course (teacher only)
router.put("/:id", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, price, cover_image, category } = req.body;

    // Verify ownership
    const existing = await pool.query(
      "SELECT teacher_id FROM courses WHERE id = $1",
      [id]
    );
    if (existing.rows.length === 0) {
      res.status(404).json({ error: "课程不存在" });
      return;
    }
    if (existing.rows[0].teacher_id !== req.user!.userId) {
      res.status(403).json({ error: "无权修改此课程" });
      return;
    }

    const result = await pool.query(
      `UPDATE courses SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        cover_image = COALESCE($4, cover_image),
        category = COALESCE($5, category),
        updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [title, description, price, cover_image, category, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update course error:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// DELETE /api/courses/:id - Delete course (teacher only)
router.delete("/:id", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await pool.query(
      "SELECT teacher_id FROM courses WHERE id = $1",
      [id]
    );
    if (existing.rows.length === 0) {
      res.status(404).json({ error: "课程不存在" });
      return;
    }
    if (existing.rows[0].teacher_id !== req.user!.userId) {
      res.status(403).json({ error: "无权删除此课程" });
      return;
    }

    await pool.query("DELETE FROM courses WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete course error:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// PATCH /api/courses/:id/status - Toggle course status (teacher only)
router.patch("/:id/status", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "draft", "archived"].includes(status)) {
      res.status(400).json({ error: "无效的状态值" });
      return;
    }

    const existing = await pool.query(
      "SELECT teacher_id FROM courses WHERE id = $1",
      [id]
    );
    if (existing.rows.length === 0) {
      res.status(404).json({ error: "课程不存在" });
      return;
    }
    if (existing.rows[0].teacher_id !== req.user!.userId) {
      res.status(403).json({ error: "无权修改此课程" });
      return;
    }

    const result = await pool.query(
      "UPDATE courses SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [status, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

export default router;
