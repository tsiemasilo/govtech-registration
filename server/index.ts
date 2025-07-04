import express, { type Request, type Response, type NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add CORS headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${timestamp} [express] ${req.method} ${req.path} ${res.statusCode} in ${duration}ms :: ${JSON.stringify(req.body).substring(0, 100)}${JSON.stringify(req.body).length > 100 ? '…' : ''}`);
  });
  
  next();
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

async function startServer() {
  try {
    console.log("🚀 Starting Govtec Registration System...");
    console.log("📧 Email service configured with verified sender");
    console.log("🗄️ In-memory storage initialized");
    
    const server = await registerRoutes(app);



    console.log("✅ Govtec Registration System ready!");
    console.log("📝 Registration endpoint: POST /api/registrations");
    console.log("📋 List registrations: GET /api/registrations");
    console.log("🔍 Verify code: POST /api/verify-code");
    
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();