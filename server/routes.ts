import express, { type Express, type Request, type Response } from "express";
import { Server } from "http";
import path from "path";
import { insertRegistrationSchema } from "../shared/schema";
import { storage } from "./storage";
import { sendEmail, generateConfirmationEmail } from "./email";
import { addToGoogleSheets } from "./googlesheets";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Serve frontend assets properly
  if (process.env.NODE_ENV === "development") {
    // In development, serve client directory as static files
    app.use(express.static(path.join(process.cwd(), 'client')));
    
    // Handle client-side routing
    app.get('*', (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      // Serve index.html for SPA routing
      res.sendFile(path.join(process.cwd(), 'client', 'index.html'));
    });
  } else {
    // Production serving
    app.use(express.static(path.join(process.cwd(), 'dist/client')));
    
    app.get('*', (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(process.cwd(), 'dist/client', 'index.html'));
    });
  }
  
  // Create registration
  app.post("/api/registrations", async (req: Request, res: Response) => {
    try {
      console.log("📝 Processing new registration...");
      
      // Validate request body
      const validationResult = insertRegistrationSchema.safeParse(req.body);
      if (!validationResult.success) {
        console.log("❌ Validation failed:", validationResult.error.errors);
        return res.status(400).json({ 
          error: "Validation failed",
          details: validationResult.error.errors 
        });
      }

      const registrationData = validationResult.data;
      console.log(`👤 Registration for: ${registrationData.firstName} ${registrationData.lastName}`);
      console.log(`📧 Email: ${registrationData.email}`);

      // Create registration
      const registration = await storage.createRegistration(registrationData);
      const formattedId = `GOV-${registration.id.toString().padStart(6, '0')}`;
      
      // Add to Google Sheets (don't block on failure)
      console.log("📊 Adding registration to Google Sheets...");
      const sheetsSuccess = await addToGoogleSheets(registration);
      if (!sheetsSuccess) {
        console.log("⚠️ Failed to add registration to Google Sheets");
      }
      
      // Send confirmation email
      console.log("📬 Preparing confirmation email...");
      const { subject, text, html } = generateConfirmationEmail(
        registration.firstName,
        registration.lastName,
        formattedId
      );

      const emailSent = await sendEmail({
        to: registration.email,
        subject,
        text,
        html
      });

      if (emailSent) {
        console.log("✅ Registration completed successfully with email confirmation");
      } else {
        console.log("⚠️ Registration created but email sending failed");
      }

      // Return registration with formatted ID
      res.json({
        ...registration,
        formattedId
      });

    } catch (error: any) {
      console.error("❌ Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Get all registrations
  app.get("/api/registrations", async (req: Request, res: Response) => {
    try {
      const registrations = await storage.getAllRegistrations();
      console.log(`📋 Retrieved ${registrations.length} registrations`);
      res.json(registrations);
    } catch (error: any) {
      console.error("❌ Error fetching registrations:", error);
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  });

  // Get single registration
  app.get("/api/registrations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const registration = await storage.getRegistration(id);
      
      if (!registration) {
        return res.status(404).json({ error: "Registration not found" });
      }

      console.log(`📄 Retrieved registration: GOV-${id.toString().padStart(6, '0')}`);
      res.json(registration);
    } catch (error: any) {
      console.error("❌ Error fetching registration:", error);
      res.status(500).json({ error: "Failed to fetch registration" });
    }
  });

  // Verify registration code
  app.post("/api/verify-code", async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: "Code is required" });
      }

      const isValid = await storage.verifyRegistrationCode(code);
      console.log(`🔍 Code verification "${code}": ${isValid ? "Valid" : "Invalid"}`);
      
      res.json({ valid: isValid });
    } catch (error: any) {
      console.error("❌ Code verification error:", error);
      res.status(500).json({ error: "Code verification failed" });
    }
  });

  const port = Number(process.env.PORT || 5000);
  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🌐 API available at http://localhost:${port}/api`);
  });

  return server;
}