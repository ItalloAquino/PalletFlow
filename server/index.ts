// TESTE DE EDIÇÃO LOCAL - Se você ver este comentário, as edições estão funcionando!
import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config();

import { pool } from "./db";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Teste de conexão com o banco
    await pool.query("SELECT NOW()");
    log("✅ Database connected");
  } catch (err) {
    log("❌ FATAL: Database connection failed");
    console.error(err);
    process.exit(1);
  }

  const server = await registerRoutes(app);

  // Novo handler de erros
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof Error && err.message.includes("ECONNREFUSED")) {
      log("🆘 Critical database connection error");
      return process.exit(1);
    }
    
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "localhost"
  }, () => {
    log(`🚀 Server running on port ${port}`);
  });
})();