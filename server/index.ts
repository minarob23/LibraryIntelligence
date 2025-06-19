import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import { setupRoutes } from './routes';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
      const logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      log(logLine);
    }
  });

  next();
});

(async () => {
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup vite in development
  if (app.get("env") === "development") {
    await setupVite(app);
  } else {
    serveStatic(app);
  }

  // Setup API routes
  await setupRoutes(app);
  console.log('🚀 API routes initialized');

  // Try ports starting from 5000, falling back to others if unavailable
  const tryPort = (port: number): Promise<number> => {
    return new Promise((resolve, reject) => {
      const server = app.listen(port, "0.0.0.0", () => {
        log(`serving on port ${port}`);
        resolve(port);
      });

      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          // Try next port
          resolve(tryPort(port + 1));
        } else {
          reject(err);
        }
      });
    });
  };

  await tryPort(5000);
})();