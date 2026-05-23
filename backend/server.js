import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.js";
import itemsRouter from "./routes/items.js";
import adminRouter from "./routes/admin.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logger (dev only)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use("/api/auth",  authRouter);
app.use("/api/items", itemsRouter);
app.use("/api/admin", adminRouter);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// 404 handler
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🚀  Find-It API running at http://localhost:${PORT}`);
  console.log(`\n   Auth:  POST /api/auth/signup  |  POST /api/auth/signin`);
  console.log(`   Items: GET/POST /api/items    |  DELETE /api/items/:id  (admin)`);
  console.log(`   Admin: /api/admin/stats       |  /api/admin/users  |  /api/admin/items\n`);
});
