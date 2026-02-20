import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from "../db.js";
import { signToken, authRequired } from "../middleware/auth.js";

const router: Router = Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      res.status(400).json({ error: "请填写所有必填字段" });
      return;
    }

    if (!["teacher", "student"].includes(role)) {
      res.status(400).json({ error: "角色必须是 teacher 或 student" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "密码至少需要6位" });
      return;
    }

    // Check if email exists
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: "该邮箱已被注册" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, avatar, created_at",
      [email, passwordHash, name, role]
    );

    const user = result.rows[0];
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.status(201).json({ token, user });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "请输入邮箱和密码" });
      return;
    }

    const result = await pool.query(
      "SELECT id, email, password_hash, name, role, avatar FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: "邮箱或密码错误" });
      return;
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: "邮箱或密码错误" });
      return;
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// GET /api/auth/me
router.get("/me", authRequired, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name, role, avatar, created_at FROM users WHERE id = $1",
      [req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "用户不存在" });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// PUT /api/auth/profile
router.put("/profile", authRequired, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: "姓名不能为空" });
      return;
    }

    const result = await pool.query(
      "UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, role, avatar, created_at",
      [name.trim(), req.user!.userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// PUT /api/auth/password
router.put("/password", authRequired, async (req: Request, res: Response) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      res.status(400).json({ error: "请填写当前密码和新密码" });
      return;
    }

    if (new_password.length < 6) {
      res.status(400).json({ error: "新密码至少需要6位" });
      return;
    }

    const result = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "用户不存在" });
      return;
    }

    const valid = await bcrypt.compare(current_password, result.rows[0].password_hash);
    if (!valid) {
      res.status(401).json({ error: "当前密码错误" });
      return;
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [newHash, req.user!.userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Update password error:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

export default router;
