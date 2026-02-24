import { Router, Request, Response } from "express";
import multer from "multer";
import pool from "../db.js";
import { authRequired, teacherOnly } from "../middleware/auth.js";
import {
  generateFileKey,
  createPresignedPutUrl,
  createPresignedGetUrl,
  isStubMode,
  saveLocalFile,
} from "../lib/s3.js";

const router: Router = Router();

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "video/mp4",
  "application/zip",
]);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

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

// PUT /api/assignments/:id — update assignment (teacher owns course)
router.put("/assignments/:id", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const teacherId = req.user!.userId;

    // Verify teacher owns the course the assignment belongs to
    const check = await pool.query(
      `SELECT a.id, a.course_id FROM assignments a
       JOIN courses c ON c.id = a.course_id
       WHERE a.id = $1 AND c.teacher_id = $2`,
      [id, teacherId],
    );
    if (check.rows.length === 0) {
      res.status(403).json({ error: "无权修改此作业" });
      return;
    }

    const { title, description, due_date } = req.body;
    const result = await pool.query(
      `UPDATE assignments
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           due_date = COALESCE($3, due_date)
       WHERE id = $4
       RETURNING *`,
      [title || null, description !== undefined ? description : null, due_date || null, id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Failed to update assignment:", err);
    res.status(500).json({ error: "更新作业失败" });
  }
});

// DELETE /api/assignments/:id — delete assignment (teacher owns course)
router.delete("/assignments/:id", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const teacherId = req.user!.userId;

    // Verify teacher owns the course the assignment belongs to
    const check = await pool.query(
      `SELECT a.id FROM assignments a
       JOIN courses c ON c.id = a.course_id
       WHERE a.id = $1 AND c.teacher_id = $2`,
      [id, teacherId],
    );
    if (check.rows.length === 0) {
      res.status(403).json({ error: "无权删除此作业" });
      return;
    }

    await pool.query("DELETE FROM assignments WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete assignment:", err);
    res.status(500).json({ error: "删除作业失败" });
  }
});

// POST /api/assignments/:id/presign — presign URL for submission file upload (student)
router.post("/assignments/:id/presign", authRequired, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { id } = req.params;
    const { filename, content_type, file_size } = req.body;

    if (!filename || !content_type) {
      res.status(400).json({ error: "filename and content_type are required" });
      return;
    }
    if (!ALLOWED_TYPES.has(content_type)) {
      res.status(400).json({ error: "File type not allowed" });
      return;
    }
    if (file_size && file_size > MAX_FILE_SIZE) {
      res.status(400).json({ error: "File size exceeds 50MB limit" });
      return;
    }

    // Verify student is enrolled in the course for this assignment
    const check = await pool.query(
      `SELECT a.id FROM assignments a
       JOIN enrollments e ON e.course_id = a.course_id AND e.student_id = $1 AND e.status = 'approved'
       WHERE a.id = $2`,
      [studentId, id],
    );
    if (check.rows.length === 0) {
      res.status(403).json({ error: "无权提交此作业" });
      return;
    }

    const fileKey = `submissions/${id}/${studentId}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200)}`;
    const uploadUrl = await createPresignedPutUrl(fileKey, content_type);

    res.json({ upload_url: uploadUrl, file_key: fileKey });
  } catch (err) {
    console.error("Failed to presign submission file:", err);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

// POST /api/assignments/:id/upload — local file upload for stub mode (student)
router.post(
  "/assignments/:id/upload",
  authRequired,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!isStubMode) {
        res.status(400).json({ error: "Direct upload is only available in local mode" });
        return;
      }
      const fileKey = req.query.file_key as string;
      if (!fileKey || !req.file) {
        res.status(400).json({ error: "file_key and file are required" });
        return;
      }
      saveLocalFile(fileKey, req.file.buffer);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to upload submission file locally:", err);
      res.status(500).json({ error: "Failed to upload file" });
    }
  },
);

// PATCH /api/assignments/:id/submit — submit assignment (student)
// Accepts optional file_key, filename, file_size, file_type for attachment
router.patch("/assignments/:id/submit", authRequired, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { id } = req.params;
    const { status, file_key, filename, file_size, file_type } = req.body;

    if (!status || !["submitted", "late"].includes(status)) {
      res.status(400).json({ error: "状态无效" });
      return;
    }

    // Create or update submission
    const result = await pool.query(
      `INSERT INTO assignment_submissions (assignment_id, student_id, status, submitted_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (assignment_id, student_id)
       DO UPDATE SET status = $3, submitted_at = NOW()
       RETURNING *`,
      [id, studentId, status],
    );

    const submission = result.rows[0];

    // If a file was uploaded, create the attachment record linked to the submission
    if (file_key && filename) {
      // Remove old attachment for this submission if exists
      await pool.query("DELETE FROM attachments WHERE submission_id = $1", [submission.id]);

      await pool.query(
        `INSERT INTO attachments (submission_id, uploader_id, filename, file_key, file_type, file_size)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [submission.id, studentId, filename, file_key, file_type || null, file_size || null],
      );
    }

    res.json(submission);
  } catch (err) {
    console.error("Failed to submit assignment:", err);
    res.status(500).json({ error: "提交作业失败" });
  }
});

// GET /api/assignments/:id/submissions — list submissions for an assignment (teacher)
router.get("/assignments/:id/submissions", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.userId;
    const { id } = req.params;

    // Verify teacher owns the course
    const check = await pool.query(
      `SELECT a.id, a.course_id FROM assignments a
       JOIN courses c ON c.id = a.course_id
       WHERE a.id = $1 AND c.teacher_id = $2`,
      [id, teacherId],
    );
    if (check.rows.length === 0) {
      res.status(403).json({ error: "无权查看此作业提交" });
      return;
    }

    const courseId = check.rows[0].course_id;

    // Get all enrolled students and their submission status
    const result = await pool.query(
      `SELECT u.id AS student_id, u.name AS student_name,
              s.status AS submission_status, s.submitted_at,
              att.filename AS attachment_filename
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       LEFT JOIN assignment_submissions s ON s.assignment_id = $1 AND s.student_id = e.student_id
       LEFT JOIN attachments att ON att.submission_id = s.id
       WHERE e.course_id = $2 AND e.status = 'approved'
       ORDER BY u.name ASC`,
      [id, courseId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to list submissions:", err);
    res.status(500).json({ error: "获取提交列表失败" });
  }
});

export default router;
