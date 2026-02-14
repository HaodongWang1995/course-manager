import express, { type Express } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import scheduleRoutes from "./routes/schedules.js";
import enrollmentRoutes from "./routes/enrollments.js";

const app: Express = express();

// Middleware
const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
];
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.length ? allowedOrigins : defaultOrigins;
      if (allowed.includes(origin)) {
        return callback(null, true);
      }
      if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
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
