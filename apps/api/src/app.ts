import express, { type Express } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import scheduleRoutes from "./routes/schedules.js";
import enrollmentRoutes from "./routes/enrollments.js";

const app: Express = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Health check (before auth-protected routes)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api", scheduleRoutes);
app.use("/api/enrollments", enrollmentRoutes);

export default app;
