import { Router, type Request, type Response } from "express";
import pool from "../db.js";
import { authRequired, teacherOnly } from "../middleware/auth.js";
import {
  generateFileKey,
  createPresignedPutUrl,
  createPresignedGetUrl,
  deleteObject,
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

// POST /api/attachments/presign — generate a presigned PUT URL (teacher only)
router.post("/attachments/presign", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const { filename, content_type, file_size, course_id, schedule_id } = req.body;

    if (!filename || !content_type) {
      res.status(400).json({ error: "filename and content_type are required" });
      return;
    }
    if (!course_id && !schedule_id) {
      res.status(400).json({ error: "course_id or schedule_id is required" });
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

    const scope: "courses" | "schedules" = course_id ? "courses" : "schedules";
    const scopeId: string = course_id || schedule_id;
    const fileKey = generateFileKey(scope, scopeId, filename);
    const uploadUrl = await createPresignedPutUrl(fileKey, content_type);

    res.json({ upload_url: uploadUrl, file_key: fileKey });
  } catch (err) {
    console.error("Failed to create presigned URL:", err);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

// POST /api/attachments/confirm — save attachment metadata after upload (teacher only)
router.post("/attachments/confirm", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const { file_key, filename, file_size, file_type, course_id, schedule_id } = req.body;
    const uploaderId = req.user!.userId;

    if (!file_key || !filename) {
      res.status(400).json({ error: "file_key and filename are required" });
      return;
    }
    if (!course_id && !schedule_id) {
      res.status(400).json({ error: "course_id or schedule_id is required" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO attachments (course_id, schedule_id, uploader_id, filename, file_key, file_type, file_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        course_id || null,
        schedule_id || null,
        uploaderId,
        filename,
        file_key,
        file_type || null,
        file_size || null,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Failed to confirm attachment:", err);
    res.status(500).json({ error: "Failed to save attachment" });
  }
});

// GET /api/courses/:id/attachments — list course attachments (auth required)
router.get("/courses/:id/attachments", authRequired, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM attachments WHERE course_id = $1 ORDER BY created_at DESC`,
      [id],
    );
    const attachments = await Promise.all(
      result.rows.map(async (a) => ({
        ...a,
        download_url: await createPresignedGetUrl(a.file_key),
      })),
    );
    res.json(attachments);
  } catch (err) {
    console.error("Failed to list course attachments:", err);
    res.status(500).json({ error: "Failed to list attachments" });
  }
});

// GET /api/schedules/:id/attachments — list schedule attachments (auth required)
router.get("/schedules/:id/attachments", authRequired, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM attachments WHERE schedule_id = $1 ORDER BY created_at DESC`,
      [id],
    );
    const attachments = await Promise.all(
      result.rows.map(async (a) => ({
        ...a,
        download_url: await createPresignedGetUrl(a.file_key),
      })),
    );
    res.json(attachments);
  } catch (err) {
    console.error("Failed to list schedule attachments:", err);
    res.status(500).json({ error: "Failed to list attachments" });
  }
});

// DELETE /api/attachments/:id — delete attachment (teacher, own only)
router.delete("/attachments/:id", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const teacherId = req.user!.userId;

    const existing = await pool.query(
      `SELECT * FROM attachments WHERE id = $1 AND uploader_id = $2`,
      [id, teacherId],
    );
    if (existing.rows.length === 0) {
      res.status(404).json({ error: "Attachment not found or no permission" });
      return;
    }

    await deleteObject(existing.rows[0].file_key);
    await pool.query("DELETE FROM attachments WHERE id = $1", [id]);

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete attachment:", err);
    res.status(500).json({ error: "Failed to delete attachment" });
  }
});

export default router;
