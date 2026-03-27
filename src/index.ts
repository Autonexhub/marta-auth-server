import { createServer } from "http";
import { auth } from "./auth";
import { env } from "./env";
import { phpClient } from "./php-client";

/**
 * Main server for local development
 * In production, Vercel handles this via serverless functions
 */

const PORT = process.env.PORT || 3000;

// Health check endpoint
async function handleHealthCheck() {
  const phpHealthy = await phpClient.healthCheck();

  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    phpBackend: phpHealthy ? "connected" : "disconnected",
  };
}

// Create HTTP server
const server = createServer(async (req, res) => {
  // Health check endpoint
  if (req.url === "/health" || req.url === "/api/health") {
    const health = await handleHealthCheck();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(health));
    return;
  }

  // All /api/auth/* routes go to better-auth
  if (req.url?.startsWith("/api/auth")) {
    return auth.handler()(req, res);
  }

  // Root endpoint
  if (req.url === "/" || req.url === "/api") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        name: "Marta Auth Server",
        version: "1.0.0",
        status: "running",
        endpoints: {
          health: "/health",
          auth: "/api/auth/*",
        },
      })
    );
    return;
  }

  // 404 for everything else
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

// Start server
server.listen(PORT, () => {
  console.log("🚀 Marta Auth Server");
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 PHP Backend: ${env.PHP_API_URL}`);
  console.log("");
  console.log("Endpoints:");
  console.log(`  - Health: http://localhost:${PORT}/health`);
  console.log(`  - Auth: http://localhost:${PORT}/api/auth/*`);
  console.log("");
  console.log("Google OAuth:");
  console.log(`  - Sign in: http://localhost:${PORT}/api/auth/signin/google`);
  console.log(`  - Callback: http://localhost:${PORT}/api/auth/callback/google`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
