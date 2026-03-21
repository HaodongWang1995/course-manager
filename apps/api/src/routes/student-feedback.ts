import { Router, Request, Response } from "express";
import pool from "../db.js";
import { authRequired, teacherOnly } from "../middleware/auth.js";

const router: Router = Router();

// Helper: verify teacher owns the course that a schedule belongs to
async function verifyTeacherSchedule(scheduleId: string, teacherId: string) {
  const result = await pool.query(
    `SELECT cs.id AS schedule_id, cs.course_id, cs.lesson_number, cs.title, cs.start_time, cs.end_time,
            c.title AS course_title, c.teacher_id
     FROM course_schedules cs
     JOIN courses c ON c.id = cs.course_id
     WHERE cs.id = $1`,
    [scheduleId],
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  if (row.teacher_id !== teacherId) return null;
  return row;
}

// GET /schedule/:scheduleId — 获取某节课所有学生反馈
router.get("/schedule/:scheduleId", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const scheduleId = req.params.scheduleId as string;
    const teacherId = req.user!.userId;

    const scheduleInfo = await verifyTeacherSchedule(scheduleId, teacherId);
    if (!scheduleInfo) {
      res.status(404).json({ error: "课时不存在或无权访问" });
      return;
    }

    // Get all approved enrolled students with LEFT JOIN feedback
    const studentsResult = await pool.query(
      `SELECT u.id AS student_id, u.name AS student_name, u.avatar AS student_avatar,
              f.id AS feedback_id, f.rating, f.comment, f.suggestion, f.status AS feedback_status, f.updated_at AS feedback_updated_at
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       LEFT JOIN student_lesson_feedback f ON f.schedule_id = $1 AND f.student_id = u.id
       WHERE e.course_id = $2 AND e.status = 'approved'
       ORDER BY u.name`,
      [scheduleId, scheduleInfo.course_id],
    );

    const students = studentsResult.rows.map((row) => ({
      student_id: row.student_id,
      student_name: row.student_name,
      student_avatar: row.student_avatar,
      feedback: row.feedback_id
        ? {
            id: row.feedback_id,
            rating: row.rating,
            comment: row.comment,
            suggestion: row.suggestion,
            status: row.feedback_status,
            updated_at: row.feedback_updated_at,
          }
        : null,
    }));

    res.json({
      schedule: {
        id: scheduleInfo.schedule_id,
        lesson_number: scheduleInfo.lesson_number,
        title: scheduleInfo.title,
        start_time: scheduleInfo.start_time,
        end_time: scheduleInfo.end_time,
      },
      course: {
        id: scheduleInfo.course_id,
        title: scheduleInfo.course_title,
      },
      students,
    });
  } catch (err) {
    console.error("Failed to get schedule feedbacks:", err);
    res.status(500).json({ error: "获取反馈失败" });
  }
});

// POST / — 创建/更新单条反馈
router.post("/", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.userId;
    const { schedule_id, student_id, rating, comment, suggestion } = req.body;

    if (!schedule_id || !student_id) {
      res.status(400).json({ error: "schedule_id 和 student_id 必填" });
      return;
    }

    const scheduleInfo = await verifyTeacherSchedule(schedule_id, teacherId);
    if (!scheduleInfo) {
      res.status(404).json({ error: "课时不存在或无权访问" });
      return;
    }

    // Check lesson ended
    if (new Date(scheduleInfo.end_time) >= new Date()) {
      res.status(400).json({ error: "课时尚未结束，无法写反馈" });
      return;
    }

    // Check student enrollment
    const enrollment = await pool.query(
      "SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2 AND status = 'approved'",
      [scheduleInfo.course_id, student_id],
    );
    if (enrollment.rows.length === 0) {
      res.status(400).json({ error: "该学生未选此课程" });
      return;
    }

    const hasContent =
      (rating != null && rating !== undefined) ||
      (comment != null && comment !== undefined && comment.trim() !== "") ||
      (suggestion != null && suggestion !== undefined && suggestion.trim() !== "");

    // Empty content → delete draft
    if (!hasContent) {
      const deleted = await pool.query(
        "DELETE FROM student_lesson_feedback WHERE schedule_id = $1 AND student_id = $2 AND status = 'draft' RETURNING id",
        [schedule_id, student_id],
      );
      if (deleted.rows.length > 0) {
        res.json({ deleted: true });
      } else {
        // Check if published exists
        const published = await pool.query(
          "SELECT id FROM student_lesson_feedback WHERE schedule_id = $1 AND student_id = $2 AND status = 'published'",
          [schedule_id, student_id],
        );
        if (published.rows.length > 0) {
          res.status(409).json({ error: "该反馈已发布，请先撤回再编辑" });
        } else {
          res.json({ deleted: true });
        }
      }
      return;
    }

    // UPSERT with concurrent safety
    const ratingVal = rating != null ? rating : null;
    const commentVal = comment && comment.trim() ? comment.trim() : null;
    const suggestionVal = suggestion && suggestion.trim() ? suggestion.trim() : null;

    const result = await pool.query(
      `INSERT INTO student_lesson_feedback (schedule_id, student_id, rating, comment, suggestion)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (schedule_id, student_id)
       DO UPDATE SET rating = $3, comment = $4, suggestion = $5, updated_at = NOW()
       WHERE student_lesson_feedback.status = 'draft'
       RETURNING *`,
      [schedule_id, student_id, ratingVal, commentVal, suggestionVal],
    );

    if (result.rows.length === 0) {
      // Conflict: record exists but is published
      res.status(409).json({ error: "该反馈已发布，请先撤回再编辑" });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Failed to save feedback:", err);
    res.status(500).json({ error: "保存反馈失败" });
  }
});

// POST /batch — 批量保存反馈
router.post("/batch", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.userId;
    const { schedule_id, feedbacks } = req.body;

    if (!schedule_id || !Array.isArray(feedbacks)) {
      res.status(400).json({ error: "schedule_id 和 feedbacks 数组必填" });
      return;
    }

    if (feedbacks.length > 50) {
      res.status(400).json({ error: "单次最多保存 50 条反馈" });
      return;
    }

    const scheduleInfo = await verifyTeacherSchedule(schedule_id, teacherId);
    if (!scheduleInfo) {
      res.status(404).json({ error: "课时不存在或无权访问" });
      return;
    }

    if (new Date(scheduleInfo.end_time) >= new Date()) {
      res.status(400).json({ error: "课时尚未结束，无法写反馈" });
      return;
    }

    // Pre-fetch approved student IDs for this course
    const enrolledResult = await pool.query(
      "SELECT student_id FROM enrollments WHERE course_id = $1 AND status = 'approved'",
      [scheduleInfo.course_id],
    );
    const enrolledStudentIds = new Set(enrolledResult.rows.map((r) => r.student_id));

    const success: string[] = [];
    const skipped: string[] = [];
    const deleted: string[] = [];
    const errors: Array<{ student_id: string; error: string }> = [];

    for (const fb of feedbacks) {
      try {
        const { student_id, rating, comment, suggestion } = fb;

        // Validate student enrollment
        if (!enrolledStudentIds.has(student_id)) {
          errors.push({ student_id, error: "该学生未选此课程" });
          continue;
        }
        const hasContent =
          (rating != null) ||
          (comment != null && comment.trim() !== "") ||
          (suggestion != null && suggestion.trim() !== "");

        if (!hasContent) {
          const del = await pool.query(
            "DELETE FROM student_lesson_feedback WHERE schedule_id = $1 AND student_id = $2 AND status = 'draft' RETURNING id",
            [schedule_id, student_id],
          );
          if (del.rows.length > 0) deleted.push(student_id);
          continue;
        }

        const ratingVal = rating != null ? rating : null;
        const commentVal = comment && comment.trim() ? comment.trim() : null;
        const suggestionVal = suggestion && suggestion.trim() ? suggestion.trim() : null;

        const result = await pool.query(
          `INSERT INTO student_lesson_feedback (schedule_id, student_id, rating, comment, suggestion)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (schedule_id, student_id)
           DO UPDATE SET rating = $3, comment = $4, suggestion = $5, updated_at = NOW()
           WHERE student_lesson_feedback.status = 'draft'
           RETURNING id`,
          [schedule_id, student_id, ratingVal, commentVal, suggestionVal],
        );

        if (result.rows.length > 0) {
          success.push(student_id);
        } else {
          skipped.push(student_id);
        }
      } catch (err) {
        errors.push({ student_id: fb.student_id, error: String(err) });
      }
    }

    res.json({ success, skipped, deleted, errors });
  } catch (err) {
    console.error("Failed to batch save feedbacks:", err);
    res.status(500).json({ error: "批量保存反馈失败" });
  }
});

// PATCH /schedule/:scheduleId/publish — 一键发布
router.patch("/schedule/:scheduleId/publish", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.userId;
    const scheduleId = req.params.scheduleId as string;

    const scheduleInfo = await verifyTeacherSchedule(scheduleId, teacherId);
    if (!scheduleInfo) {
      res.status(404).json({ error: "课时不存在或无权访问" });
      return;
    }

    if (new Date(scheduleInfo.end_time) >= new Date()) {
      res.status(400).json({ error: "课时尚未结束，无法发布反馈" });
      return;
    }

    const result = await pool.query(
      `UPDATE student_lesson_feedback SET status = 'published', updated_at = NOW()
       WHERE schedule_id = $1 AND status = 'draft'
       AND (rating IS NOT NULL OR comment IS NOT NULL OR suggestion IS NOT NULL)`,
      [scheduleId],
    );

    res.json({ published_count: result.rowCount || 0 });
  } catch (err) {
    console.error("Failed to publish feedbacks:", err);
    res.status(500).json({ error: "发布反馈失败" });
  }
});

// PATCH /:id/revoke — 撤回反馈
router.patch("/:id/revoke", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.userId;
    const { id } = req.params;

    // Verify ownership via schedule → course
    const feedback = await pool.query(
      `SELECT f.*, c.teacher_id
       FROM student_lesson_feedback f
       JOIN course_schedules cs ON cs.id = f.schedule_id
       JOIN courses c ON c.id = cs.course_id
       WHERE f.id = $1`,
      [id],
    );

    if (feedback.rows.length === 0) {
      res.status(404).json({ error: "反馈不存在" });
      return;
    }

    if (feedback.rows[0].teacher_id !== teacherId) {
      res.status(403).json({ error: "无权操作此反馈" });
      return;
    }

    if (feedback.rows[0].status !== "published") {
      res.status(400).json({ error: "只能撤回已发布的反馈" });
      return;
    }

    const result = await pool.query(
      "UPDATE student_lesson_feedback SET status = 'draft', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Failed to revoke feedback:", err);
    res.status(500).json({ error: "撤回反馈失败" });
  }
});

// GET /my — 学生获取自己的反馈
router.get("/my", authRequired, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const courseId = req.query.course_id as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    let whereClause = "WHERE f.student_id = $1 AND f.status = 'published'";
    const params: (string | number)[] = [studentId];

    if (courseId) {
      params.push(courseId);
      whereClause += ` AND cs.course_id = $${params.length}`;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM student_lesson_feedback f
       JOIN course_schedules cs ON cs.id = f.schedule_id
       ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count);

    const dataResult = await pool.query(
      `SELECT f.id, f.schedule_id, f.student_id, f.rating, f.comment, f.suggestion,
              f.status, f.created_at, f.updated_at,
              cs.lesson_number, cs.title AS lesson_title, cs.start_time AS lesson_date,
              c.title AS course_title, c.id AS course_id,
              u.name AS teacher_name
       FROM student_lesson_feedback f
       JOIN course_schedules cs ON cs.id = f.schedule_id
       JOIN courses c ON c.id = cs.course_id
       JOIN users u ON u.id = c.teacher_id
       ${whereClause}
       ORDER BY cs.start_time DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );

    res.json({ data: dataResult.rows, total, page, limit });
  } catch (err) {
    console.error("Failed to get my feedbacks:", err);
    res.status(500).json({ error: "获取反馈失败" });
  }
});

// GET /my/latest — 学生最新一条反馈
router.get("/my/latest", authRequired, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;

    const result = await pool.query(
      `SELECT f.id, f.schedule_id, f.student_id, f.rating, f.comment, f.suggestion,
              f.status, f.created_at, f.updated_at,
              cs.lesson_number, cs.title AS lesson_title, cs.start_time AS lesson_date,
              c.title AS course_title, c.id AS course_id,
              u.name AS teacher_name
       FROM student_lesson_feedback f
       JOIN course_schedules cs ON cs.id = f.schedule_id
       JOIN courses c ON c.id = cs.course_id
       JOIN users u ON u.id = c.teacher_id
       WHERE f.student_id = $1 AND f.status = 'published'
       ORDER BY cs.start_time DESC
       LIMIT 1`,
      [studentId],
    );

    res.json(result.rows[0] || null);
  } catch (err) {
    console.error("Failed to get latest feedback:", err);
    res.status(500).json({ error: "获取反馈失败" });
  }
});

// GET /my/course/:courseId — 学生某课程反馈
router.get("/my/course/:courseId", authRequired, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { courseId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM student_lesson_feedback f
       JOIN course_schedules cs ON cs.id = f.schedule_id
       WHERE f.student_id = $1 AND f.status = 'published' AND cs.course_id = $2`,
      [studentId, courseId],
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT f.id, f.schedule_id, f.student_id, f.rating, f.comment, f.suggestion,
              f.status, f.created_at, f.updated_at,
              cs.lesson_number, cs.title AS lesson_title, cs.start_time AS lesson_date,
              c.title AS course_title, c.id AS course_id,
              u.name AS teacher_name
       FROM student_lesson_feedback f
       JOIN course_schedules cs ON cs.id = f.schedule_id
       JOIN courses c ON c.id = cs.course_id
       JOIN users u ON u.id = c.teacher_id
       WHERE f.student_id = $1 AND f.status = 'published' AND cs.course_id = $2
       ORDER BY cs.start_time DESC
       LIMIT $3 OFFSET $4`,
      [studentId, courseId, limit, offset],
    );

    res.json({ data: result.rows, total, page, limit });
  } catch (err) {
    console.error("Failed to get course feedbacks:", err);
    res.status(500).json({ error: "获取反馈失败" });
  }
});

// GET /student/:studentId/course/:courseId — 老师查看学生历史
router.get("/student/:studentId/course/:courseId", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.userId;
    const { studentId, courseId } = req.params;

    // Verify teacher owns course
    const course = await pool.query("SELECT teacher_id FROM courses WHERE id = $1", [courseId]);
    if (course.rows.length === 0 || course.rows[0].teacher_id !== teacherId) {
      res.status(403).json({ error: "无权访问此课程" });
      return;
    }

    const result = await pool.query(
      `SELECT f.id, f.schedule_id, f.student_id, f.rating, f.comment, f.suggestion,
              f.status, f.created_at, f.updated_at,
              cs.lesson_number, cs.title AS lesson_title, cs.start_time AS lesson_date
       FROM student_lesson_feedback f
       JOIN course_schedules cs ON cs.id = f.schedule_id
       WHERE f.student_id = $1 AND cs.course_id = $2
       ORDER BY cs.start_time DESC`,
      [studentId, courseId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to get student history:", err);
    res.status(500).json({ error: "获取反馈历史失败" });
  }
});

export default router;
