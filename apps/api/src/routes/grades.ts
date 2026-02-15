import { Router, Request, Response } from "express";
import pool from "../db.js";
import { authRequired, teacherOnly } from "../middleware/auth.js";

const router: Router = Router();

// POST /api/grades — create or upsert grade (teacher)
router.post("/", authRequired, teacherOnly, async (req: Request, res: Response) => {
  try {
    const { course_id, student_id, type, label, score, max_score } = req.body;
    if (!course_id || !student_id || !type || score === undefined) {
      res.status(400).json({ error: "课程、学生、类型和分数必填" });
      return;
    }

    // Verify teacher owns course
    const course = await pool.query("SELECT teacher_id FROM courses WHERE id = $1", [course_id]);
    if (course.rows.length === 0 || course.rows[0].teacher_id !== req.user!.userId) {
      res.status(403).json({ error: "无权操作此课程" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO grades (course_id, student_id, type, label, score, max_score)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [course_id, student_id, type, label || null, score, max_score || 100],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Failed to create grade:", err);
    res.status(500).json({ error: "创建成绩失败" });
  }
});

// GET /api/students/grades — student grade summary
router.get("/students/grades", authRequired, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;

    // Get all grades grouped by course
    const gradesResult = await pool.query(
      `SELECT g.course_id, g.type, g.label, g.score, g.max_score,
              c.title AS course_title,
              u.name AS teacher_name
       FROM grades g
       JOIN courses c ON c.id = g.course_id
       JOIN users u ON u.id = c.teacher_id
       WHERE g.student_id = $1
       ORDER BY c.title, g.type`,
      [studentId],
    );

    // Group by course and compute summary
    const courseMap = new Map<string, {
      course_id: string;
      name: string;
      teacher: string;
      grades: Array<{ type: string; label: string | null; score: number; max_score: number }>;
    }>();

    for (const row of gradesResult.rows) {
      if (!courseMap.has(row.course_id)) {
        courseMap.set(row.course_id, {
          course_id: row.course_id,
          name: row.course_title,
          teacher: row.teacher_name,
          grades: [],
        });
      }
      courseMap.get(row.course_id)!.grades.push({
        type: row.type,
        label: row.label,
        score: parseFloat(row.score),
        max_score: parseFloat(row.max_score),
      });
    }

    const courses = Array.from(courseMap.values()).map((c) => {
      const totalScore = c.grades.reduce((sum, g) => sum + g.score, 0);
      const totalMax = c.grades.reduce((sum, g) => sum + g.max_score, 0);
      const overall = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

      const midtermGrade = c.grades.find((g) => g.type === "midterm");
      const finalGrade = c.grades.find((g) => g.type === "final");

      return {
        course_id: c.course_id,
        name: c.name,
        teacher: c.teacher,
        overall,
        midterm: midtermGrade ? `${Math.round(midtermGrade.score)}` : "-",
        final: finalGrade ? `${Math.round(finalGrade.score)}` : "-",
      };
    });

    // Compute GPA (simple: avg of overall percentages mapped to 4.0 scale)
    const avgPercent = courses.length > 0
      ? courses.reduce((sum, c) => sum + c.overall, 0) / courses.length
      : 0;
    const gpa = avgPercent >= 90 ? "4.0" : avgPercent >= 80 ? "3.5" : avgPercent >= 70 ? "3.0" : avgPercent >= 60 ? "2.5" : "2.0";

    res.json({
      gpa,
      rank: "-",
      completion: courses.length > 0 ? `${Math.round(avgPercent)}%` : "0%",
      courses,
      chartData: courses.map((c) => ({
        subject: c.name.length > 6 ? c.name.slice(0, 6) : c.name,
        you: c.overall,
        avg: 75,
      })),
    });
  } catch (err) {
    console.error("Failed to get student grades:", err);
    res.status(500).json({ error: "获取成绩失败" });
  }
});

export default router;
