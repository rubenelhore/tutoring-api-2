/**
 * Main entry point
 * Equivalent to: if __name__ == "__main__": uvicorn.run(app) in FastAPI
 */

import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import { config } from "./config";
import { initializeDatabase } from "./database";

// Import routes
import authRoutes from "./routes/auth";
import sessionRoutes from "./routes/sessions";

const app: Express = express();

// ============ GLOBAL MIDDLEWARES ============

// CORS (allow requests from frontend)
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Body parser (parse JSON automatically)
// In FastAPI: app = FastAPI() does this automatically
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.path}`);
  next();
});

// ============ ROUTES ============

// Root route - API info
app.get("/", (req: Request, res: Response) => {
  res.json({
    name: "Tutoring API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/auth (register, login)",
      sessions: "/sessions (tutoring sessions)"
    }
  });
});

// Health check route (to verify server is alive)
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Authentication routes
app.use("/auth", authRoutes);

// Session routes
app.use("/sessions", sessionRoutes);

// 404 route
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// ============ GLOBAL ERROR HANDLER ============

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Global error handler:", error);
  res.status(error.status || 500).json({
    error: error.message || "Internal server error"
  });
});

// ============ STARTUP ============

const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();

    // Start server
    const port = config.server.port;
    app.listen(port, () => {
      console.log(`
🚀 Server running on http://localhost:${port}
📚 Environment: ${config.server.env}
🗄️  Database: ${config.database.host}:${config.database.port}/${config.database.database}
      `);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Execute only if this is the main file
if (require.main === module) {
  startServer();
}

export default app;
