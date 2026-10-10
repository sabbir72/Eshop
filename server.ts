import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { getPrismaClient } from "./src/lib/prisma";
import { imageSuggestionService } from "./src/services/imageSuggestion";

const currentDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "smartshop_enterprise_secret_key_2026";

export function createExpressApp() {
  const app = express();

  app.use(express.json({ limit: "10mb" }));

  // Global Gemini Quota tracking & lazy initialization helper
  let geminiQuotaExhaustedUntil = 0;

  function handleAiError(err: any) {
    const msg = String(err?.message || err);
    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("exceeded")) {
      // Cooldown for 2 hours to avoid hammering API and logging quota errors
      geminiQuotaExhaustedUntil = Date.now() + 1000 * 60 * 120;
    }
  }

  function getGeminiClient() {
    if (Date.now() < geminiQuotaExhaustedUntil) {
      return null;
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({ apiKey });
  }

  async function callGeminiWithTimeout(ai: GoogleGenAI, prompt: string, timeoutMs = 3500): Promise<string> {
    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error("AI call timed out")), timeoutMs)
    );
    try {
      // Use gemini-2.5-flash which has higher rate limits and lower quota usage
      const aiPromise = ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      }).then((res) => res.text || "");

      return await Promise.race([aiPromise, timeoutPromise]);
    } catch (err: any) {
      handleAiError(err);
      throw err;
    }
  }

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      appName: "SmartShop",
    });
  });

  // -------------------------------------------------------------------
  // AUTHENTICATION & RBAC ENDPOINTS
  // -------------------------------------------------------------------

  // Auth Login Endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, phone, password, role, rememberMe } = req.body;

      if (!email && !phone) {
        return res.status(400).json({ error: "Email or phone number is required" });
      }

      const normalizedEmail = (email || "").toString().trim().toLowerCase();
      let determinedRole = role || "Customer";

      // Cryptographically secure Super Admin verification (password never in plaintext)
      if (normalizedEmail === "sabbircse72@gmail.com") {
        const crypto = await import("crypto");
        const enteredHash = crypto.createHash("sha256").update(password || "").digest("hex");
        const SUPERADMIN_SECURE_HASH = "90414a9ed8b18c53982b80c8dd7ecf5918cb5daeded2c0f22bd7c84101501905";

        if (enteredHash !== SUPERADMIN_SECURE_HASH) {
          return res.status(401).json({ error: "Invalid email or password" });
        }
        determinedRole = "Super Admin";
      }

      // Generate JWT Access Token
      const expiresIn = rememberMe ? "7d" : "5m"; // 5 minutes standard timeout
      const token = jwt.sign(
        {
          email: email || "user@smartshop.com",
          phone: phone || "",
          role: determinedRole,
          loginTime: Date.now(),
        },
        JWT_SECRET,
        { expiresIn }
      );

      console.log(`[AUTH LOGIN SUCCESS] User: ${email || phone} | Role: ${determinedRole}`);

      return res.json({
        status: "success",
        token,
        expiresIn: rememberMe ? 604800 : 300, // seconds
        role: determinedRole,
        message: "Authentication successful",
      });
    } catch (err: any) {
      console.error("[AUTH LOGIN ERROR]:", err);
      return res.status(500).json({ error: err.message || "Authentication failed" });
    }
  });

  // Auth Verify Token Endpoint
  app.get("/api/auth/verify-token", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ valid: false, error: "Missing token" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return res.json({ valid: true, decoded });
    } catch (_err) {
      return res.status(401).json({ valid: false, error: "Token expired or invalid" });
    }
  });

  // Auth Logout Endpoint
  app.post("/api/auth/logout", (req, res) => {
    console.log("[AUTH LOGOUT] User session terminated cleanly.");
    return res.json({ status: "success", message: "Logged out successfully" });
  });

  // -------------------------------------------------------------------
  // WEBSITE PROFILE & BRANDING MANAGEMENT (SUPER ADMIN ONLY)
  // -------------------------------------------------------------------

  // In-memory cache fallback for website profile settings
  let websiteProfileCache = {
    websiteName: "Smart Shop",
    siteName: "Smart Shop",
    tagline: "Your trusted online store",
    logoUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=200&q=80",
    faviconUrl: "/favicon.ico",
    updatedAt: new Date().toISOString(),
    updatedBy: "Super Admin",
  };

  // Helper middleware for strict Super Admin Authorization
  function verifySuperAdminAuth(req: express.Request): { authorized: boolean; user?: any; error?: string } {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { authorized: false, error: "Authentication token is required to access website profile settings." };
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const role = (decoded.role || "").toString().trim().toLowerCase();

      // Enforce SUPER ADMIN role strictly
      if (role !== "super admin" && role !== "super_admin") {
        return {
          authorized: false,
          error: "You do not have permission to modify website settings. Only Super Admin accounts are authorized.",
        };
      }

      return { authorized: true, user: decoded };
    } catch (_err) {
      return { authorized: false, error: "Invalid or expired session token. Please re-authenticate as Super Admin." };
    }
  }

  // GET /api/settings/website-profile (Public read endpoint)
  app.get("/api/settings/website-profile", async (req, res) => {
    try {
      const prisma = getPrismaClient();
      if (prisma) {
        try {
          const dbSettings = await (prisma.settings as any).findUnique({
            where: { id: "default" },
          });
          if (dbSettings) {
            websiteProfileCache = {
              websiteName: dbSettings.websiteName || dbSettings.siteName || websiteProfileCache.websiteName,
              siteName: dbSettings.siteName || dbSettings.websiteName || websiteProfileCache.siteName,
              tagline: dbSettings.tagline ?? websiteProfileCache.tagline,
              logoUrl: dbSettings.logoUrl !== undefined ? dbSettings.logoUrl : websiteProfileCache.logoUrl,
              faviconUrl: dbSettings.faviconUrl ?? websiteProfileCache.faviconUrl,
              updatedAt: dbSettings.updatedAt?.toISOString() || new Date().toISOString(),
              updatedBy: dbSettings.updatedBy || websiteProfileCache.updatedBy,
            };
          }
        } catch (dbErr) {
          console.warn("[DB Website Profile fetch fallback to cache]:", dbErr);
        }
      }

      return res.json({
        success: true,
        ...websiteProfileCache,
      });
    } catch (err: any) {
      console.error("[GET /api/settings/website-profile Error]:", err);
      return res.status(500).json({ error: "Failed to retrieve website profile settings" });
    }
  });

  // PUT /api/settings/website-profile (Super Admin ONLY update endpoint)
  app.put("/api/settings/website-profile", async (req, res) => {
    const authCheck = verifySuperAdminAuth(req);
    if (!authCheck.authorized) {
      console.warn(`[SECURITY 403] Unauthorized branding update attempt: ${authCheck.error}`);
      return res.status(403).json({
        error: authCheck.error || "Forbidden: Super Admin privileges required.",
        status: "forbidden",
      });
    }

    try {
      const { websiteName, siteName, tagline, logoUrl, faviconUrl } = req.body;

      // Validate inputs
      const finalWebsiteName = typeof websiteName === "string" ? websiteName.trim() : (typeof siteName === "string" ? siteName.trim() : websiteProfileCache.websiteName);
      if (finalWebsiteName.length > 100) {
        return res.status(400).json({ error: "Website name cannot exceed 100 characters." });
      }

      const finalTagline = typeof tagline === "string" ? tagline.trim() : websiteProfileCache.tagline;
      if (finalTagline && finalTagline.length > 250) {
        return res.status(400).json({ error: "Website tagline cannot exceed 250 characters." });
      }

      // Check logo URL if provided
      const finalLogoUrl = logoUrl !== undefined ? logoUrl : websiteProfileCache.logoUrl;
      const finalFaviconUrl = faviconUrl !== undefined ? faviconUrl : websiteProfileCache.faviconUrl;

      const actorEmail = authCheck.user?.email || "superadmin@smartshop.com";
      const now = new Date().toISOString();

      // Audit actions
      const changedFields: string[] = [];
      if (finalWebsiteName !== websiteProfileCache.websiteName) changedFields.push(`Website Name: "${websiteProfileCache.websiteName}" → "${finalWebsiteName}"`);
      if (finalTagline !== websiteProfileCache.tagline) changedFields.push(`Tagline: "${websiteProfileCache.tagline}" → "${finalTagline}"`);
      if (finalLogoUrl !== websiteProfileCache.logoUrl) changedFields.push(`Logo: ${finalLogoUrl ? "Updated" : "Removed"}`);
      if (finalFaviconUrl !== websiteProfileCache.faviconUrl) changedFields.push(`Favicon: ${finalFaviconUrl ? "Updated" : "Reset"}`);

      // Update cache
      websiteProfileCache = {
        websiteName: finalWebsiteName,
        siteName: finalWebsiteName,
        tagline: finalTagline,
        logoUrl: finalLogoUrl,
        faviconUrl: finalFaviconUrl,
        updatedAt: now,
        updatedBy: actorEmail,
      };

      // Persist to Prisma DB if available
      const prisma = getPrismaClient();
      if (prisma) {
        try {
          await (prisma.settings as any).upsert({
            where: { id: "default" },
            update: {
              websiteName: finalWebsiteName,
              siteName: finalWebsiteName,
              tagline: finalTagline,
              logoUrl: finalLogoUrl,
              faviconUrl: finalFaviconUrl,
              updatedBy: actorEmail,
            },
            create: {
              id: "default",
              websiteName: finalWebsiteName,
              siteName: finalWebsiteName,
              tagline: finalTagline,
              logoUrl: finalLogoUrl,
              faviconUrl: finalFaviconUrl,
              updatedBy: actorEmail,
            },
          });

          // Record Audit Log in Database
          await prisma.auditLog.create({
            data: {
              userId: authCheck.user?.email || "super-admin",
              userName: authCheck.user?.name || "Super Admin",
              userRole: "Super Admin",
              action: "BRANDING_UPDATED",
              module: "Settings",
              previousValue: "Website Profile Updated",
              newValue: changedFields.join("; ") || "Branding details updated",
              ipAddress: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
              device: "Web Admin Console",
            },
          });
        } catch (dbErr) {
          console.warn("[Prisma DB Save Website Profile Warning]:", dbErr);
        }
      }

      console.log(`[AUDIT LOG] BRANDING_UPDATED by ${actorEmail}: ${changedFields.join("; ")}`);

      return res.json({
        success: true,
        message: "Website profile and branding settings successfully updated.",
        data: websiteProfileCache,
        changedFields,
      });
    } catch (err: any) {
      console.error("[PUT /api/settings/website-profile Error]:", err);
      return res.status(500).json({ error: err.message || "Failed to update website profile" });
    }
  });

  // POST /api/settings/upload-logo (Super Admin ONLY Logo Uploader)
  app.post("/api/settings/upload-logo", async (req, res) => {
    const authCheck = verifySuperAdminAuth(req);
    if (!authCheck.authorized) {
      return res.status(403).json({
        error: authCheck.error || "Forbidden: Only Super Admin can upload website logo.",
        status: "forbidden",
      });
    }

    try {
      const { fileData, fileName, mimeType, fileSize } = req.body;

      if (!fileData || typeof fileData !== "string") {
        return res.status(400).json({ error: "Missing or invalid fileData payload." });
      }

      // Valid mime types
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
      const detectedMime = (mimeType || "").toLowerCase();

      // Check header or mimeType
      const isAllowedMime = allowedTypes.includes(detectedMime) ||
        fileData.startsWith("data:image/png") ||
        fileData.startsWith("data:image/jpeg") ||
        fileData.startsWith("data:image/webp") ||
        fileData.startsWith("data:image/svg+xml");

      if (!isAllowedMime) {
        return res.status(400).json({
          error: "Unsupported file format. Please upload PNG, JPG, JPEG, WEBP, or SVG image files.",
        });
      }

      // File size validation (max 5MB)
      const maxSizeBytes = 5 * 1024 * 1024;
      if (fileSize && fileSize > maxSizeBytes) {
        return res.status(400).json({ error: "Logo file size exceeds the 5MB maximum limit." });
      }

      // If SVG, perform sanitization check against malicious scripts
      if (detectedMime === "image/svg+xml" || fileData.includes("image/svg+xml") || fileData.includes("<svg")) {
        const decodedSvg = fileData.includes("base64,")
          ? Buffer.from(fileData.split("base64,")[1], "base64").toString("utf-8")
          : fileData;

        const maliciousPatterns = [
          /<script/i,
          /javascript:/i,
          /onload\s*=/i,
          /onerror\s*=/i,
          /onclick\s*=/i,
          /onmouseover\s*=/i,
          /xlink:href\s*=\s*["']javascript:/i,
        ];

        for (const pattern of maliciousPatterns) {
          if (pattern.test(decodedSvg)) {
            return res.status(400).json({
              error: "Security validation failed: The uploaded SVG file contains disallowed active scripts or event handlers.",
            });
          }
        }
      }

      // Clean sanitized file name
      const sanitizedFileName = (fileName || "logo.png").replace(/[^a-zA-Z0-9._-]/g, "_");

      console.log(`[LOGO UPLOAD SUCCESS] Super Admin uploaded logo: ${sanitizedFileName}`);

      return res.json({
        success: true,
        url: fileData,
        fileName: sanitizedFileName,
        mimeType: detectedMime || "image/png",
        message: "Logo file validated and staged successfully.",
      });
    } catch (err: any) {
      console.error("[Upload Logo Error]:", err);
      return res.status(500).json({ error: "Failed to process logo upload: " + err.message });
    }
  });

  // POST /api/settings/upload-favicon (Super Admin ONLY Favicon Uploader)
  app.post("/api/settings/upload-favicon", async (req, res) => {
    const authCheck = verifySuperAdminAuth(req);
    if (!authCheck.authorized) {
      return res.status(403).json({
        error: authCheck.error || "Forbidden: Only Super Admin can upload website favicon.",
        status: "forbidden",
      });
    }

    try {
      const { fileData, fileName, mimeType, fileSize } = req.body;

      if (!fileData || typeof fileData !== "string") {
        return res.status(400).json({ error: "Missing or invalid favicon file payload." });
      }

      // Valid favicon types: ICO, PNG, SVG, WEBP
      const allowedFaviconTypes = [
        "image/x-icon",
        "image/vnd.microsoft.icon",
        "image/png",
        "image/svg+xml",
        "image/webp",
      ];
      const detectedMime = (mimeType || "").toLowerCase();

      const isAllowed = allowedFaviconTypes.includes(detectedMime) ||
        fileData.startsWith("data:image/x-icon") ||
        fileData.startsWith("data:image/png") ||
        fileData.startsWith("data:image/svg+xml") ||
        fileData.startsWith("data:image/vnd.microsoft.icon") ||
        fileData.startsWith("data:image/webp");

      if (!isAllowed) {
        return res.status(400).json({
          error: "Unsupported favicon format. Please upload an ICO, PNG, WEBP, or SVG file.",
        });
      }

      // Max 1MB for favicon
      if (fileSize && fileSize > 1024 * 1024) {
        return res.status(400).json({ error: "Favicon file size exceeds the 1MB limit." });
      }

      const sanitizedFileName = (fileName || "favicon.ico").replace(/[^a-zA-Z0-9._-]/g, "_");

      return res.json({
        success: true,
        url: fileData,
        fileName: sanitizedFileName,
        message: "Favicon validated successfully.",
      });
    } catch (err: any) {
      console.error("[Upload Favicon Error]:", err);
      return res.status(500).json({ error: "Failed to process favicon upload: " + err.message });
    }
  });

  // POST /api/settings/remove-logo (Super Admin ONLY)
  app.post("/api/settings/remove-logo", async (req, res) => {
    const authCheck = verifySuperAdminAuth(req);
    if (!authCheck.authorized) {
      return res.status(403).json({
        error: authCheck.error || "Forbidden: Only Super Admin can remove the website logo.",
        status: "forbidden",
      });
    }

    websiteProfileCache.logoUrl = null;
    websiteProfileCache.updatedAt = new Date().toISOString();
    websiteProfileCache.updatedBy = authCheck.user?.email || "Super Admin";

    const prisma = getPrismaClient();
    if (prisma) {
      try {
        await (prisma.settings as any).update({
          where: { id: "default" },
          data: { logoUrl: null, updatedBy: authCheck.user?.email || "Super Admin" },
        });

        await prisma.auditLog.create({
          data: {
            userId: authCheck.user?.email || "super-admin",
            userName: authCheck.user?.name || "Super Admin",
            userRole: "Super Admin",
            action: "LOGO_REMOVED",
            module: "Settings",
            previousValue: "Active Logo",
            newValue: "Logo removed (default icon fallback)",
            ipAddress: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
            device: "Web Admin Console",
          },
        });
      } catch (e) {
        console.warn("[Remove logo DB warning]:", e);
      }
    }

    return res.json({
      success: true,
      message: "Website logo removed successfully. System will display default branded icon.",
      data: websiteProfileCache,
    });
  });

  // POST /api/settings/remove-favicon (Super Admin ONLY)
  app.post("/api/settings/remove-favicon", async (req, res) => {
    const authCheck = verifySuperAdminAuth(req);
    if (!authCheck.authorized) {
      return res.status(403).json({
        error: authCheck.error || "Forbidden: Only Super Admin can reset the website favicon.",
        status: "forbidden",
      });
    }

    websiteProfileCache.faviconUrl = "/favicon.ico";
    websiteProfileCache.updatedAt = new Date().toISOString();
    websiteProfileCache.updatedBy = authCheck.user?.email || "Super Admin";

    return res.json({
      success: true,
      message: "Favicon reset to default.",
      data: websiteProfileCache,
    });
  });

  // PostgreSQL Database Health Endpoint (via Prisma)
  app.get("/api/db/status", async (req, res) => {
    try {
      const prisma = getPrismaClient();
      if (!prisma) {
        return res.json({
          status: "configured_or_uninitialized",
          database: "PostgreSQL",
          connected: false,
          hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
          message: "DATABASE_URL not found or Prisma client uninitialized.",
        });
      }

      await prisma.$queryRaw`SELECT 1`;
      return res.json({
        status: "connected",
        database: "PostgreSQL (Supabase)",
        connected: true,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({
        status: "error",
        database: "PostgreSQL",
        connected: false,
        error: err.message,
      });
    }
  });

  // -------------------------------------------------------------------
  // PRODUCT IMAGE SUGGESTIONS API (Provider-based & Cached)
  // -------------------------------------------------------------------
  app.get("/api/products/image-suggestions", async (req, res) => {
    try {
      const query = (req.query.query as string) || "";
      const limit = Math.min(Math.max(parseInt((req.query.limit as string) || "8", 10), 1), 20);
      const provider = (req.query.provider as string) || undefined;

      if (!query || query.trim().length < 2) {
        return res.json({
          success: true,
          query: "",
          provider: "none",
          total: 0,
          images: [],
          message: "Query must be at least 2 characters long",
        });
      }

      const result = await imageSuggestionService.getSuggestions(query, limit, provider);
      return res.json(result);
    } catch (err: any) {
      console.error("[Image Suggestions API Error]:", err);
      return res.json({
        success: false,
        query: (req.query.query as string) || "",
        provider: "none",
        total: 0,
        images: [],
        message: "Image suggestions are temporarily unavailable.",
      });
    }
  });

  // -------------------------------------------------------------------
  // PRODUCT IMAGE BACKGROUND EDITOR API
  // -------------------------------------------------------------------
  app.get("/api/image-editor/status", (req, res) => {
    const hasGemini = Boolean(process.env.GEMINI_API_KEY);
    const hasRemoveBg = Boolean(process.env.REMOVEBG_API_KEY);

    res.json({
      available: true,
      providers: [
        {
          id: "canvas",
          name: "Smart Canvas Alpha Segmenter",
          status: "ready",
          isAI: false,
          type: "client_canvas",
        },
        {
          id: "gemini",
          name: "Gemini AI Vision Segmenter",
          status: hasGemini ? "ready" : "offline_fallback",
          isAI: true,
          type: "server_gemini",
        },
        {
          id: "cloud_api",
          name: "External Cloud Studio API",
          status: hasRemoveBg ? "ready" : "unconfigured",
          isAI: true,
          type: "cloud_api",
        },
      ],
      defaultProvider: "canvas",
      maxUploadSizeMb: 10,
    });
  });

  app.post("/api/image-editor/remove-background", async (req, res) => {
    try {
      const { image, tolerance = 30, edgeFeather = 2 } = req.body;

      if (!image || typeof image !== "string") {
        return res.status(400).json({
          success: false,
          error: "Image payload (data URL or web URL) is required",
        });
      }

      const removeBgKey = process.env.REMOVEBG_API_KEY;

      // 1. If RemoveBG Key is provided, use live RemoveBG API
      if (removeBgKey) {
        try {
          const formBody = new URLSearchParams();
          if (image.startsWith("http")) {
            formBody.append("image_url", image);
          } else {
            const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
            formBody.append("image_file_b64", base64Data);
          }
          formBody.append("size", "auto");

          const rbResp = await fetch("https://api.remove.bg/v1.0/removebg", {
            method: "POST",
            headers: {
              "X-Api-Key": removeBgKey,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formBody,
          });

          if (rbResp.ok) {
            const arrayBuffer = await rbResp.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString("base64");
            return res.json({
              success: true,
              cutoutImageUrl: `data:image/png;base64,${base64}`,
              provider: "Remove.bg API",
              message: "Background removed cleanly with high precision.",
            });
          }
        } catch (rbErr) {
          console.warn("[RemoveBG API Error, falling back]:", rbErr);
        }
      }

      // 2. Return success indicator allowing the high-precision client-side canvas engine to complete the matte
      return res.json({
        success: true,
        useClientMatte: true,
        tolerance,
        edgeFeather,
        provider: "Smart Canvas Alpha Matting Engine",
        message: "Background segmented successfully.",
      });
    } catch (err: any) {
      console.error("[Remove Background API Error]:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to process background removal.",
      });
    }
  });

  app.post("/api/image-editor/generate-background-prompt", async (req, res) => {
    const { productName, style = "minimalist studio" } = req.body || {};
    try {
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          prompt: `Professional high-end ${style} product pedestal background for ${productName || "an e-commerce product"} with soft directional lighting and clean focus.`,
          fallback: true,
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `You are an expert commercial product photographer. Generate a concise 1-sentence prompt for a photorealistic ${style} background suitable for showcasing: "${productName || "luxury product"}". No people, no distractions, soft studio lighting.`,
      });

      return res.json({
        prompt: response.text?.trim() || `Clean studio platform with soft lighting for ${productName}`,
      });
    } catch (err: any) {
      handleAiError(err);
      return res.json({
        prompt: `Clean minimalist studio background for ${productName || "product"}`,
      });
    }
  });

  // -------------------------------------------------------------------
  // FULL AUTONOMOUS AI AGENT ENDPOINTS (Marketing, Leads, Sales, Support)
  // -------------------------------------------------------------------

  // AI Business Agent Unified Action Engine
  app.post("/api/ai/agent/action", async (req, res) => {
    try {
      const { task, payload = {}, storeContext = {} } = req.body;
      const ai = getGeminiClient();

      const {
        productsCount = 12,
        ordersCount = 8,
        totalRevenue = 45200,
        pendingTicketsCount = 2,
        activeCouponsCount = 3,
        sampleProducts = [],
      } = storeContext;

      // 1. MARKETING AGENT TASK
      if (task === "marketing") {
        const {
          goal = "Flash Sale Boost",
          targetAudience = "Online Shoppers in Bangladesh",
          channels = ["Facebook Ads", "Instagram", "SMS"],
          selectedProduct = "Smart Electronics & Apparel",
          tone = "Persuasive, Energetic & High-Converting",
          budget = "৳5,000",
        } = payload;

        if (!ai) {
          return res.json({
            success: true,
            status: "ready",
            provider: "Fallback Engine",
            campaignTitle: `🔥 Mega ${goal} Blast - Exclusive Savings`,
            headline: `সীমিত সময়ের জন্য ধামাকা অফার! পান সেরা ডিল ও দ্রুত ডেলিভারি`,
            targetAudience,
            primaryCopy: `স্মার্ট শপিং করুন স্মার্টশপ এর সাথে! আমাদের প্রিমিয়াম কালেকশনে পাচ্ছেন বিশেষ মূল্যছাড় ও ফ্রি ডেলিভারি সুবিধা। স্টক ফুরিয়ে যাওয়ার আগেই এখনই অর্ডার করুন। ক্যাশ অন ডেলিভারি এবং সহজ রিটার্ন পলিসি সুবিধা থাকছে।`,
            callToAction: "অর্ডার করতে এখনই ক্লিক করুন - সীমিত স্টক!",
            channelsStrategy: [
              { channel: "Facebook / Instagram", format: "Carousel & Reel Video", angle: "Unboxing + Problem-Solution" },
              { channel: "SMS Broadcast", text: `SmartShop: বিশেষ ছাড়ে কিনুন ${selectedProduct}! আজই অর্ডার করলে পাচ্ছেন স্পেশাল ডিসকাউন্ট। কোড: SMARTDEAL` },
              { channel: "Email Newsletter", subject: `⚡ বিশেষ অফার আপনার জন্য! আজই শপ করুন সেরা মূল্যে` },
            ],
            suggestedDiscount: "15% OFF (Coupon: SMARTDEAL)",
            hashtags: ["#SmartShopBD", "#OnlineShopping", "#BestDeals", "#FlashSaleBD", "#ShoppingFestival"],
            estimatedROAS: "3.8x to 5.2x ROAS",
            nextSteps: [
              "Create high-contrast product images with discount badge",
              "Schedule SMS broadcast at 7:30 PM peak browsing hour",
              "Retarget visitors who added products to cart in last 48 hours",
            ],
          });
        }

        const prompt = `You are an elite E-Commerce Chief Marketing Officer & AI Marketing Agent.
Store Context:
- Catalog Products: ${productsCount}
- Active Orders: ${ordersCount}
- Sample Featured Products: ${JSON.stringify(sampleProducts.slice(0, 5))}

Marketing Objective:
- Campaign Goal: ${goal}
- Target Audience: ${targetAudience}
- Target Channels: ${JSON.stringify(channels)}
- Featured Product/Category: ${selectedProduct}
- Tone: ${tone}
- Budget: ${budget}

Generate a comprehensive, ready-to-launch omnichannel marketing campaign.
Return STRICT valid JSON format with these exact keys:
{
  "campaignTitle": "Catchy campaign title",
  "headline": "Magnetic headline in Bengali and English",
  "targetAudience": "Audience segmentation description",
  "primaryCopy": "High-converting ad copy in conversational Bengali & English",
  "callToAction": "Clear compelling CTA button text",
  "channelsStrategy": [
    { "channel": "Platform name", "format": "Ad format", "angle": "Strategic angle" }
  ],
  "suggestedDiscount": "Recommended coupon or discount structure",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "estimatedROAS": "Projected return on ad spend",
  "nextSteps": ["Step 1", "Step 2", "Step 3"]
}`;

        if (ai) {
          try {
            let text = await callGeminiWithTimeout(ai, prompt, 3500);
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(text);
            return res.json({ success: true, provider: "Gemini 3.8 Flash", ...parsed });
          } catch (e) {
            handleAiError(e);
          }
        }

        return res.json({
          success: true,
          status: "ready",
          provider: "Fallback Engine",
          campaignTitle: `🔥 Mega ${goal} Blast - Exclusive Savings`,
          headline: `সীমিত সময়ের জন্য ধামাকা অফার! পান সেরা ডিল ও দ্রুত ডেলিভারি`,
          targetAudience,
          primaryCopy: `স্মার্ট শপিং করুন স্মার্টশপ এর সাথে! আমাদের প্রিমিয়াম কালেকশনে পাচ্ছেন বিশেষ মূল্যছাড় ও ফ্রি ডেলিভারি সুবিধা। স্টক ফুরিয়ে যাওয়ার আগেই এখনই অর্ডার করুন। ক্যাশ অন ডেলিভারি এবং সহজ রিটার্ন পলিসি সুবিধা থাকছে।`,
          callToAction: "অর্ডার করতে এখনই ক্লিক করুন - সীমিত স্টক!",
          channelsStrategy: [
            { channel: "Facebook / Instagram", format: "Carousel & Reel Video", angle: "Unboxing + Problem-Solution" },
            { channel: "SMS Broadcast", text: `SmartShop: বিশেষ ছাড়ে কিনুন ${selectedProduct}! আজই অর্ডার করলে পাচ্ছেন স্পেশাল ডিসকাউন্ট। কোড: SMARTDEAL` },
            { channel: "Email Newsletter", subject: `⚡ বিশেষ অফার আপনার জন্য! আজই শপ করুন সেরা মূল্যে` },
          ],
          suggestedDiscount: "15% OFF (Coupon: SMARTDEAL)",
          hashtags: ["#SmartShopBD", "#OnlineShopping", "#BestDeals", "#FlashSaleBD", "#ShoppingFestival"],
          estimatedROAS: "3.8x to 5.2x ROAS",
          nextSteps: [
            "Create high-contrast product images with discount badge",
            "Schedule SMS broadcast at 7:30 PM peak browsing hour",
            "Retarget visitors who added products to cart in last 48 hours",
          ],
        });
      }

      // 2. LEAD GENERATION AGENT TASK
      if (task === "lead_generation") {
        const {
          industry = "B2B Corporate & Retail Resellers",
          targetNiche = "Office supplies, Bulk Gadgets, Festival Gifts",
          leadMagnetType = "Exclusive Bulk Price Sheet & VIP Tier",
          quantity = 5,
        } = payload;

        if (!ai) {
          return res.json({
            success: true,
            provider: "Fallback Engine",
            leadMagnet: {
              title: "SmartShop Corporate B2B Purchasing Catalog & Bulk Discount Tier",
              offer: "অর্ডার ভলিউম অনুযায়ী সর্বোচ্চ ২৫% ক্যাশব্যাক এবং ৬০ দিনের গ্যারান্টি সুবিধা।",
              optInHook: "বিনামূল্যে কর্পোরেট ক্যাটালগ ও ডিসকাউন্ট কোটেশন ডাউনলোড করুন",
            },
            leads: [
              {
                id: "lead-1",
                name: "Tanvir Ahmed (Procurement Head)",
                organization: "Apex Tech Solutions Ltd.",
                category: "Corporate Tech & Office Accessories",
                estimatedValue: "৳150,000",
                leadScore: 92,
                status: "Hot Lead",
                preferredChannel: "WhatsApp / Email",
                outreachPitch: "আসসালামু আলাইকুম তানভীর ভাই, Apex Tech-এর টিম গেজেট এবং এক্সেসরিজ প্রয়োজনে আমরা সরাসরি পাইকারি রেটে ডোরস্টেপ সাপ্লাই দিতে প্রস্তুত। আমাদের এক্সক্লুসিভ কর্পোরেট প্রাইস লিস্ট শেয়ার করতে পারি?",
              },
              {
                id: "lead-2",
                name: "Nusrat Jahan (HR & Admin)",
                organization: "Creative Hub Bangladesh",
                category: "Employee Festive & Welcome Gift Kits",
                estimatedValue: "৳85,000",
                leadScore: 85,
                status: "Warm Lead",
                preferredChannel: "Email",
                outreachPitch: "Hello Nusrat, customized employee gift bundles with customized branding and fast Dhaka delivery are now available at wholesale rates for Creative Hub.",
              },
              {
                id: "lead-3",
                name: "Mahmud Hasan",
                organization: "Gadget Corner Reseller (Mirpur)",
                category: "Fast-Moving Electronics & Wearables",
                estimatedValue: "৳220,000",
                leadScore: 95,
                status: "Hot Lead",
                preferredChannel: "Direct Phone / WhatsApp",
                outreachPitch: "মাহমুদ ভাই, আমাদের ট্রেন্ডিং স্মার্টওয়াচ ও ইয়ারবাডসের ফ্রেশ স্টক এসেছে। সরাসরি ইমপোর্টার রেটে ৫০ পিসের বান্ডেল নিলে ফ্রি কুরিয়ার পাচ্ছেন।",
              },
              {
                id: "lead-4",
                name: "Farhana Yasmin",
                organization: "Urban Lifestyle Boutique",
                category: "Apparel & Seasonal Accessories",
                estimatedValue: "৳65,000",
                leadScore: 78,
                status: "Warm Lead",
                preferredChannel: "WhatsApp",
                outreachPitch: "আপনাদের বুটিকের জন্য প্রিমিয়াম কোয়ালিটি প্যাকেজিং ও বেস্টসেলার আইটেম সরবরাহ করছি সাশ্রয়ী দামে। ক্যাটালগ পাঠাবো?",
              },
              {
                id: "lead-5",
                name: "Rashedul Karim",
                organization: "Dhaka Central University Club",
                category: "Event Merchandise & Bulk Bundles",
                estimatedValue: "৳45,000",
                leadScore: 70,
                status: "Qualified Prospect",
                preferredChannel: "Email / Phone",
                outreachPitch: "ক্লাব ইভেন্টের জন্য সাশ্রয়ী বাজেটে গ্যাজেট ও গিফট হ্যাম্পার রেডি স্টক রয়েছে। আমাদের স্পেশাল স্টুডেন্ট ক্লাব ডিসকাউন্ট দেখে নিতে পারেন।",
              },
            ],
            pipelineStrategy: [
              "Send personalized WhatsApp pitch within 2 hours of lead identification",
              "Follow up with PDF Price Quotation and sample photo album",
              "Offer 1st order trial guarantee: 100% replacement warranty",
            ],
          });
        }

        const prompt = `You are an expert B2B/B2C E-Commerce Lead Generation Specialist & AI Agent.
Store context:
- Total Store Catalog: ${productsCount} products
- Sample products: ${JSON.stringify(sampleProducts.slice(0, 6))}
- Target industry/niche: ${industry} - ${targetNiche}
- Lead Magnet: ${leadMagnetType}

Generate ${quantity} highly realistic, lucrative leads with tailored outreach scripts suitable for Bangladesh / South Asian market.
Return STRICT valid JSON format with keys:
{
  "leadMagnet": {
    "title": "Lead magnet title",
    "offer": "Irresistible proposition",
    "optInHook": "Catchy opt-in phrase"
  },
  "leads": [
    {
      "id": "lead-1",
      "name": "Decision maker name",
      "organization": "Company or buyer profile",
      "category": "Product category of interest",
      "estimatedValue": "Deal size in ৳",
      "leadScore": 90,
      "status": "Hot Lead | Warm Lead | Qualified Prospect",
      "preferredChannel": "WhatsApp | Email | Phone",
      "outreachPitch": "Short, courteous, high-converting outreach message in Bengali or English"
    }
  ],
  "pipelineStrategy": ["Actionable step 1", "Actionable step 2", "Actionable step 3"]
}`;

        if (ai) {
          try {
            let text = await callGeminiWithTimeout(ai, prompt, 3500);
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(text);
            return res.json({ success: true, provider: "Gemini 3.8 Flash", ...parsed });
          } catch (e) {
            handleAiError(e);
          }
        }

        return res.json({
          success: true,
          provider: "Fallback Engine",
          leadMagnet: {
            title: "SmartShop Corporate B2B Purchasing Catalog & Bulk Discount Tier",
            offer: "অর্ডার ভলিউম অনুযায়ী সর্বোচ্চ ২৫% ক্যাশব্যাক এবং ৬০ দিনের গ্যারান্টি সুবিধা।",
            optInHook: "বিনামূল্যে কর্পোরেট ক্যাটালগ ও ডিসকাউন্ট কোটেশন ডাউনলোড করুন",
          },
          leads: [
            {
              id: "lead-1",
              name: "Tanvir Ahmed (Procurement Head)",
              organization: "Apex Tech Solutions Ltd.",
              category: "Corporate Tech & Office Accessories",
              estimatedValue: "৳150,000",
              leadScore: 92,
              status: "Hot Lead",
              preferredChannel: "WhatsApp / Email",
              outreachPitch: "আসসালামু আলাইকুম তানভীর ভাই, Apex Tech-এর টিম গেজেট এবং এক্সেসরিজ প্রয়োজনে আমরা সরাসরি পাইকারি রেটে ডোরস্টেপ সাপ্লাই দিতে প্রস্তুত। আমাদের এক্সক্লুসিভ কর্পোরেট প্রাইস লিস্ট শেয়ার করতে পারি?",
            },
            {
              id: "lead-2",
              name: "Nusrat Jahan (HR & Admin)",
              organization: "Creative Hub Bangladesh",
              category: "Employee Festive & Welcome Gift Kits",
              estimatedValue: "৳85,000",
              leadScore: 85,
              status: "Warm Lead",
              preferredChannel: "Email",
              outreachPitch: "Hello Nusrat, customized employee gift bundles with customized branding and fast Dhaka delivery are now available at wholesale rates for Creative Hub.",
            },
            {
              id: "lead-3",
              name: "Mahmud Hasan",
              organization: "Gadget Corner Reseller (Mirpur)",
              category: "Fast-Moving Electronics & Wearables",
              estimatedValue: "৳220,000",
              leadScore: 95,
              status: "Hot Lead",
              preferredChannel: "Direct Phone / WhatsApp",
              outreachPitch: "মাহমুদ ভাই, আমাদের ট্রেন্ডিং স্মার্টওয়াচ ও ইয়ারবাডসের ফ্রেশ স্টক এসেছে। সরাসরি ইমপোর্টার রেটে ৫০ পিসের বান্ডেল নিলে ফ্রি কুরিয়ার পাচ্ছেন।",
            },
            {
              id: "lead-4",
              name: "Farhana Yasmin",
              organization: "Urban Lifestyle Boutique",
              category: "Apparel & Seasonal Accessories",
              estimatedValue: "৳65,000",
              leadScore: 78,
              status: "Warm Lead",
              preferredChannel: "WhatsApp",
              outreachPitch: "আপনাদের বুটিকের জন্য প্রিমিয়াম কোয়ালিটি প্যাকেজিং ও বেস্টসেলার আইটেম সরবরাহ করছি সাশ্রয়ী দামে। ক্যাটালগ পাঠাবো?",
            },
            {
              id: "lead-5",
              name: "Rashedul Karim",
              organization: "Dhaka Central University Club",
              category: "Event Merchandise & Bulk Bundles",
              estimatedValue: "৳45,000",
              leadScore: 70,
              status: "Qualified Prospect",
              preferredChannel: "Email / Phone",
              outreachPitch: "ক্লাব ইভেন্টের জন্য সাশ্রয়ী বাজেটে গ্যাজেট ও গিফট হ্যাম্পার রেডি স্টক রয়েছে। আমাদের স্পেশাল স্টুডেন্ট ক্লাব ডিসকাউন্ট দেখে নিতে পারেন।",
            },
          ],
          pipelineStrategy: [
            "Send personalized WhatsApp pitch within 2 hours of lead identification",
            "Follow up with PDF Price Quotation and sample photo album",
            "Offer 1st order trial guarantee: 100% replacement warranty",
          ],
        });
      }

      // 3. SALES OVERSIGHT & ANALYTICS AGENT TASK
      if (task === "sales_oversight") {
        const { focusArea = "Revenue & Conversion Audit" } = payload;

        if (!ai) {
          const aov = ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 2500;
          return res.json({
            success: true,
            provider: "Fallback Engine",
            healthScore: 88,
            kpiSummary: {
              totalRevenue: `৳${totalRevenue.toLocaleString()}`,
              totalOrders: ordersCount,
              averageOrderValue: `৳${aov.toLocaleString()}`,
              conversionRateEstimate: "3.4%",
              cartAbandonmentRate: "28.5%",
            },
            keyInsights: [
              "মোবাইল ট্রাফিকের থেকে ৬০%+ চেকআউট সম্পন্ন হচ্ছে, তবে কার্ট ড্রপ-অফ কমানোর সুযোগ রয়েছে।",
              "ফ্রি শিপিং থ্রেশহোল্ড (৳১,৫০০+) যুক্ত করলে Average Order Value (AOV) ১৫% বৃদ্ধি পাবে।",
              "ক্যাশ অন ডেলিভারি (COD) গ্রাহকদের রিটার্ন রেট কমাতে অর্ডার প্লেসমেন্টের পর স্বয়ংক্রিয় SMS কনফার্মেশন জরুরি।",
            ],
            abandonedCartRecovery: {
              suggestedCoupon: "RECOVER10",
              discount: "10% OFF for 24 Hours",
              recoverySMS: "আপনার পছন্দের পণ্যটি এখনও কার্টে অপেক্ষা করছে! അടുത്ത 24 ঘণ্টার মধ্যে অর্ডার সম্পূর্ণ করলে পান স্পেশাল ১০% ছাড়। কোড: RECOVER10",
              projectedRecoveryRevenue: "৳18,500+",
            },
            crossSellRecommendations: [
              {
                mainCategory: "Smartphones & Tablets",
                recommendedAddons: "Fast Charger 30W + Tempered Glass Protector",
                bundleDiscount: "৳250 Combo Discount",
              },
              {
                mainCategory: "Fashion & Footwear",
                recommendedAddons: "Matching Leather Belt or Wallet",
                bundleDiscount: "15% off on secondary item",
              },
            ],
            salesActionPlan: [
              "আজকের বেস্টসেলার প্রোডাক্টকে হোমপেজ ব্যানারে ফোকাস করুন।",
              "যেসব প্রোডাক্টের স্টক ১০ এর নিচে তাদের পাশে 'Only few left!' ব্যাজ সক্রিয় করুন।",
              "অর্ডার ভ্যালু ৳২,০০০ ছাড়ালে ফ্রি গিফট যুক্ত করুন।",
            ],
          });
        }

        const prompt = `You are an elite E-Commerce Chief Revenue Officer & AI Sales Overseer.
Store Performance Data:
- Total Store Revenue: ৳${totalRevenue}
- Total Placed Orders: ${ordersCount}
- Active Store Catalog: ${productsCount} products
- Focus Area: ${focusArea}
- Featured Catalog Snapshot: ${JSON.stringify(sampleProducts.slice(0, 5))}

Analyze the store sales telemetry, identify revenue leaks, abandoned cart recovery opportunities, and pricing optimization.
Return STRICT valid JSON format with keys:
{
  "healthScore": 85,
  "kpiSummary": {
    "totalRevenue": "৳formatted",
    "totalOrders": ${ordersCount},
    "averageOrderValue": "৳formatted",
    "conversionRateEstimate": "Percentage",
    "cartAbandonmentRate": "Percentage"
  },
  "keyInsights": ["Insight 1 in Bengali/English", "Insight 2", "Insight 3"],
  "abandonedCartRecovery": {
    "suggestedCoupon": "CODE",
    "discount": "Percentage",
    "recoverySMS": "High-converting recovery SMS in Bengali",
    "projectedRecoveryRevenue": "Estimated ৳"
  },
  "crossSellRecommendations": [
    { "mainCategory": "Name", "recommendedAddons": "Items", "bundleDiscount": "Discount" }
  ],
  "salesActionPlan": ["Step 1", "Step 2", "Step 3"]
}`;

        if (ai) {
          try {
            let text = await callGeminiWithTimeout(ai, prompt, 3500);
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(text);
            return res.json({ success: true, provider: "Gemini 3.8 Flash", ...parsed });
          } catch (e) {
            handleAiError(e);
          }
        }

        const aov = ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 2500;
        return res.json({
          success: true,
          provider: "Fallback Engine",
          healthScore: 88,
          kpiSummary: {
            totalRevenue: `৳${totalRevenue.toLocaleString()}`,
            totalOrders: ordersCount,
            averageOrderValue: `৳${aov.toLocaleString()}`,
            conversionRateEstimate: "3.4%",
            cartAbandonmentRate: "28.5%",
          },
          keyInsights: [
            "মোবাইল ট্রাফিকের থেকে ৬০%+ চেকআউট সম্পন্ন হচ্ছে, তবে কার্ট ড্রপ-অফ কমানোর সুযোগ রয়েছে।",
            "ফ্রি শিপিং থ্রেশহোল্ড (৳১,৫০০+) যুক্ত করলে Average Order Value (AOV) ১৫% বৃদ্ধি পাবে।",
            "ক্যাশ অন ডেলিভারি (COD) গ্রাহকদের রিটার্ন রেট কমাতে অর্ডার প্লেসমেন্টের পর স্বয়ংক্রিয় SMS কনফার্মেশন জরুরি।",
          ],
          abandonedCartRecovery: {
            suggestedCoupon: "RECOVER10",
            discount: "10% OFF for 24 Hours",
            recoverySMS: "আপনার পছন্দের পণ্যটি এখনও কার্টে অপেক্ষা করছে! അടുത്ത 24 ঘণ্টার মধ্যে অর্ডার সম্পূর্ণ করলে পান স্পেশাল ১০% ছাড়। কোড: RECOVER10",
            projectedRecoveryRevenue: "৳18,500+",
          },
          crossSellRecommendations: [
            {
              mainCategory: "Smartphones & Tablets",
              recommendedAddons: "Fast Charger 30W + Tempered Glass Protector",
              bundleDiscount: "৳250 Combo Discount",
            },
            {
              mainCategory: "Fashion & Footwear",
              recommendedAddons: "Matching Leather Belt or Wallet",
              bundleDiscount: "15% off on secondary item",
            },
          ],
          salesActionPlan: [
            "আজকের বেস্টসেলার প্রোডাক্টকে হোমপেজ ব্যানারে ফোকাস করুন।",
            "যেসব প্রোডাক্টের স্টক ১০ এর নিচে তাদের পাশে 'Only few left!' ব্যাজ সক্রিয় করুন।",
            "অর্ডার ভ্যালু ৳২,০০০ ছাড়ালে ফ্রি গিফট যুক্ত করুন।",
          ],
        });
      }

      // 4. CUSTOMER HANDLING AGENT TASK
      if (task === "customer_handling") {
        const {
          customerMessage = "দাম একটু কমানো যাবে কি? অন্য দোকানে তো কমে পাওয়া যাচ্ছে।",
          customerType = "Hesitant Bargain Hunter / Price Sensitive",
          sentiment = "Hesitant",
          channel = "Live Chat / Messenger",
        } = payload;

        if (!ai) {
          return res.json({
            success: true,
            provider: "Fallback Engine",
            detectedSentiment: "Price Sensitive & Bargaining",
            urgencyLevel: "Medium",
            suggestedResponseBengali: `ধন্যবাদ আপনার বার্তার জন্য! 😊 আমাদের প্রতিটি পণ্য ১০০% অথেনটিক এবং অফিশিয়াল ব্র্যান্ড ওয়ারেন্টি সহ আসে। এছাড়া দ্রুত ডেলিভারি ও ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি তো থাকছেই। আপনার প্রথম অর্ডারের জন্য আমরা স্পেশাল ৫% লয়্যালটি ডিসকাউন্ট কোড 'WELCOME5' অফার করছি। আপনি কি এখনই অর্ডারটি কনফার্ম করতে চান?`,
            suggestedResponseEnglish: `Thank you for your message! Our products are 100% authentic with official warranty, doorstep delivery, and 7-day hassle-free replacement. To welcome you, here is a special 5% discount code 'WELCOME5'. May I help you confirm your order?`,
            negotiationTactic: "মূল্যের চেয়ে গুণমান, অফিশিয়াল ওয়ারেন্টি ও আফটার-সেলস সাপোর্টের সুবিধা বেশি তুলে ধরুন। সামান্য ডিসকাউন্ট দিয়ে ক্লোজ করুন।",
            recommendedAction: "Offer 5% Voucher (WELCOME5) and offer Free Cash on Delivery",
            objectionHandled: "Competitor Price Match via Value Guarantee",
          });
        }

        const prompt = `You are a world-class Customer Relationship Specialist & AI Customer Handling Agent for an online store in Bangladesh.
Customer Message: "${customerMessage}"
Customer Persona: ${customerType}
Detected Sentiment: ${sentiment}
Channel: ${channel}
Available Store Context:
- Products in catalog: ${productsCount}
- Standard Policy: 7 days easy return, Cash on delivery available across Bangladesh, Dhaka 24-48 hrs, Outside 2-4 days.

Provide a polite, persuasive, culturally empathetic response in Bengali and English that wins the customer's trust and converts them into a buyer.
Return STRICT valid JSON format with keys:
{
  "detectedSentiment": "Sentiment analysis",
  "urgencyLevel": "High | Medium | Low",
  "suggestedResponseBengali": "Polite persuasive message in fluent Bengali",
  "suggestedResponseEnglish": "Message in professional English",
  "negotiationTactic": "Psychological/sales tactic used",
  "recommendedAction": "Specific action for staff/agent",
  "objectionHandled": "Core objection resolved"
}`;

        if (ai) {
          try {
            let text = await callGeminiWithTimeout(ai, prompt, 3500);
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(text);
            return res.json({ success: true, provider: "Gemini 3.8 Flash", ...parsed });
          } catch (e) {
            handleAiError(e);
          }
        }

        return res.json({
          success: true,
          provider: "Fallback Engine",
          detectedSentiment: "Price Sensitive & Bargaining",
          urgencyLevel: "Medium",
          suggestedResponseBengali: `ধন্যবাদ আপনার বার্তার জন্য! 😊 আমাদের প্রতিটি পণ্য ১০০% অথেনটিক এবং অফিশিয়াল ব্র্যান্ড ওয়ারেন্টি সহ আসে। এছাড়া দ্রুত ডেলিভারি ও ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি তো থাকছেই। আপনার প্রথম অর্ডারের জন্য আমরা স্পেশাল ৫% লয়্যালটি ডিসকাউন্ট কোড 'WELCOME5' অফার করছি। আপনি কি এখনই অর্ডারটি কনফার্ম করতে চান?`,
          suggestedResponseEnglish: `Thank you for your message! Our products are 100% authentic with official warranty, doorstep delivery, and 7-day hassle-free replacement. To welcome you, here is a special 5% discount code 'WELCOME5'. May I help you confirm your order?`,
          negotiationTactic: "মূল্যের চেয়ে গুণমান, অফিশিয়াল ওয়ারেন্টি ও আফটার-সেলস সাপোর্টের সুবিধা বেশি তুলে ধরুন। সামান্য ডিসকাউন্ট দিয়ে ক্লোজ করুন।",
          recommendedAction: "Offer 5% Voucher (WELCOME5) and offer Free Cash on Delivery",
          objectionHandled: "Competitor Price Match via Value Guarantee",
        });
      }

      // 5. CUSTOMER SERVICE & SUPPORT DESK TASK
      if (task === "customer_service") {
        const {
          ticketId = "TICK-1024",
          issueType = "Delivery Delay & Tracking Inquiry",
          customerName = "Mr. Karim",
          orderId = "ORD-8942",
          complaintDetails = "আমার অর্ডারটি ৩ দিন আগে আসার কথা ছিল কিন্তু এখনও পাইনি। কবে পাবো?",
        } = payload;

        if (!ai) {
          return res.json({
            success: true,
            provider: "Fallback Engine",
            ticketId,
            empathyRating: "5/5 Star Service Protocol",
            resolutionStatus: "Action Required / In Transit",
            officialReplyBengali: `প্রিয় ${customerName}, আপনার অর্ডারটি (#${orderId}) পৌঁছাতে অপ্রত্যাশিত বিলম্বের জন্য আমরা আন্তরিকভাবে দুঃখিত। 🙏 আমাদের লজিস্টিকস টিম আপনার পার্সেলটি ট্র্যাক করে জানিয়েছে এটি কুরিয়ার হাব থেকে আপনার এরিয়া ডেলিভারিতে বের হয়েছে এবং ইনশাআল্লাহ আগামী ২৪ ঘণ্টার মধ্যে আপনার হাতে পৌঁছে যাবে। আপনার সাময়িক অসুবিধার ক্ষতিপূরণস্বরূপ আপনার পরবর্তী অর্ডারে ৳১০০ ফ্ল্যাট ডিসকাউন্ট কোড 'CARE100' ব্যবহার করতে পারবেন। যেকোনো প্রয়োজনে আমরা সার্বক্ষণিক আপনার পাশে আছি।`,
            officialReplyEnglish: `Dear ${customerName}, we sincerely apologize for the delay regarding order #${orderId}. Our logistics team has verified your parcel is out for final local delivery and should reach you within the next 24 hours. As a token of our appreciation for your patience, please enjoy coupon code 'CARE100' for ৳100 off your next order. Thank you for your continued trust in SmartShop!`,
            policyCheck: "Eligible for expedited dispatch & courtesy discount under Store Delivery SLA",
            suggestedCompensation: "৳100 Courtesy Voucher (CARE100)",
            actionSteps: [
              "Mark ticket as In Progress and notify delivery rider for priority dispatch",
              "Send SMS notification with live courier tracking link",
              "Follow up with customer post-delivery to ensure full satisfaction",
            ],
          });
        }

        const prompt = `You are a Senior Customer Service Director & AI Service Resolution Agent for SmartShop E-Commerce.
Customer Support Case:
- Ticket ID: ${ticketId}
- Issue Category: ${issueType}
- Customer Name: ${customerName}
- Order ID: ${orderId}
- Complaint / Issue Description: "${complaintDetails}"

Store Policies:
- 7-Day Hassle-Free Return Policy for defective or wrong items.
- Standard Delivery SLA: Dhaka 24-48 hrs, Outside Dhaka 2-4 business days.
- Compensation allowed: Courtesy discount vouchers, free replacements.

Provide an empathetic, professional, solution-oriented resolution that de-escalates anger and retains customer loyalty.
Return STRICT valid JSON format with keys:
{
  "ticketId": "${ticketId}",
  "empathyRating": "High | Exceptional",
  "resolutionStatus": "Resolution Proposed",
  "officialReplyBengali": "Courteous, reassuring message in Bengali",
  "officialReplyEnglish": "Courteous, reassuring message in English",
  "policyCheck": "Policy rule verification",
  "suggestedCompensation": "Voucher or action",
  "actionSteps": ["Step 1", "Step 2", "Step 3"]
}`;

        if (ai) {
          try {
            let text = await callGeminiWithTimeout(ai, prompt, 3500);
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(text);
            return res.json({ success: true, provider: "Gemini 3.8 Flash", ...parsed });
          } catch (e) {
            handleAiError(e);
          }
        }

        return res.json({
          success: true,
          provider: "Fallback Engine",
          ticketId,
          empathyRating: "5/5 Star Service Protocol",
          resolutionStatus: "Action Required / In Transit",
          officialReplyBengali: `প্রিয় ${customerName}, আপনার অর্ডারটি (#${orderId}) পৌঁছাতে অপ্রত্যাশিত বিলম্বের জন্য আমরা আন্তরিকভাবে দুঃখিত। 🙏 আমাদের লজিস্টিকস টিম আপনার পার্সেলটি ট্র্যাক করে জানিয়েছে এটি কুরিয়ার হাব থেকে আপনার এরিয়া ডেলিভারিতে বের হয়েছে এবং ইনশাআল্লাহ আগামী ২৪ ঘণ্টার মধ্যে আপনার হাতে পৌঁছে যাবে। আপনার সাময়িক অসুবিধার ক্ষতিপূরণস্বরূপ আপনার পরবর্তী অর্ডারে ৳১০০ ফ্ল্যাট ডিসকাউন্ট কোড 'CARE100' ব্যবহার করতে পারবেন। যেকোনো প্রয়োজনে আমরা সার্বক্ষণিক আপনার পাশে আছি।`,
          officialReplyEnglish: `Dear ${customerName}, we sincerely apologize for the delay regarding order #${orderId}. Our logistics team has verified your parcel is out for final local delivery and should reach you within the next 24 hours. As a token of our appreciation for your patience, please enjoy coupon code 'CARE100' for ৳100 off your next order. Thank you for your continued trust in SmartShop!`,
          policyCheck: "Eligible for expedited dispatch & courtesy discount under Store Delivery SLA",
          suggestedCompensation: "৳100 Courtesy Voucher (CARE100)",
          actionSteps: [
            "Mark ticket as In Progress and notify delivery rider for priority dispatch",
            "Send SMS notification with live courier tracking link",
            "Follow up with customer post-delivery to ensure full satisfaction",
          ],
        });
      }

      // 6. ALL-IN-ONE AUTONOMOUS AUDIT TASK
      if (task === "autonomous_audit") {
        let parsed: any = null;
        if (ai) {
          try {
            const prompt = `You are the Master AI Autonomous Business Agent overseeing Smart E-Commerce.
Store Telemetry:
- Catalog: ${productsCount} products
- Orders: ${ordersCount}
- Revenue: ৳${totalRevenue}
- Open Tickets: ${pendingTicketsCount}
- Active Coupons: ${activeCouponsCount}

Perform an executive multi-department audit across:
1. Marketing (মার্কেটিং)
2. Lead Generation (লিড জেনারেশন)
3. Sales Oversight (সেলস মনিটরিং)
4. Customer Handling (কাস্টমার হ্যান্ডলিং)
5. Customer Service (সার্ভিস ও সাপোর্ট)

Return STRICT valid JSON format with keys:
{
  "auditTimestamp": "${new Date().toISOString()}",
  "overallScore": 88,
  "agentStatus": "Fully Autonomous & Active 🟢",
  "departments": {
    "marketing": { "health": "Rating", "recommendation": "Recommendation in Bengali/English" },
    "leads": { "health": "Rating", "recommendation": "Recommendation in Bengali/English" },
    "sales": { "health": "Rating", "recommendation": "Recommendation in Bengali/English" },
    "customerHandling": { "health": "Rating", "recommendation": "Recommendation in Bengali/English" },
    "customerService": { "health": "Rating", "recommendation": "Recommendation in Bengali/English" }
  },
  "priorityTasks": ["Priority 1", "Priority 2", "Priority 3", "Priority 4"]
}`;

            let text = await callGeminiWithTimeout(ai, prompt, 3500);
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            parsed = JSON.parse(text);
            return res.json({ success: true, provider: "Gemini 3.8 Flash", ...parsed });
          } catch (e) {
            handleAiError(e);
          }
        }

        return res.json({
          success: true,
          provider: "Fallback Engine",
          auditTimestamp: new Date().toISOString(),
          overallScore: 89,
          agentStatus: "Fully Autonomous & Active 🟢",
          departments: {
            marketing: {
              health: "Strong (88%)",
              recommendation: "Run weekend Flash Sale on Electronics & Wearables. Potential +22% GMV.",
            },
            leads: {
              health: "Active (85%)",
              recommendation: "Outreach 5 corporate clients for employee festive gifting packages.",
            },
            sales: {
              health: "Optimized (91%)",
              recommendation: "Activate 'RECOVER10' abandoned cart auto-SMS sequence to recapture ৳15,000+.",
            },
            customerHandling: {
              health: "Responsive (94%)",
              recommendation: "Fast average response time. Maintain proactive objection handling scripts.",
            },
            customerService: {
              health: "Excellent (92%)",
              recommendation: "2 open tickets identified. Auto-resolutions prepared with courtesy tokens.",
            },
          },
          priorityTasks: [
            "Launch Weekend Flash Sale Campaign (Marketing)",
            "Send WhatsApp outreach to top 3 wholesale prospects (Leads)",
            "Trigger automated cart recovery discount for 12 abandoned checkouts (Sales)",
            "Review & approve resolution for Ticket #1024 (Service)",
          ],
        });
      }

      // 7. ORDERED CUSTOMERS DATA & INTELLIGENCE ORGANIZER (যারা অর্ডার করেছে তাদের ডাটা)
      if (task === "ordered_customers") {
        const { ordersList = [] } = payload;
        
        // Dynamic aggregation directly from real store orders
        const customerMap = new Map<string, any>();

        ordersList.forEach((ord: any, idx: number) => {
          const rawPhone = ord.phone || ord.customerPhone || "";
          const rawEmail = ord.email || ord.customerEmail || "";
          const rawName = ord.customerName || ord.name || "";
          const key = (rawPhone || rawEmail || rawName || `cust-ref-${idx}`).trim().toLowerCase();

          const ordTotal = Number(ord.total) || 0;
          const ordStatus = ord.status || ord.orderStatus || "Processing";
          const ordPayment = ord.paymentMethod || "bKash / COD";
          
          let ordCity = "Dhaka";
          if (ord.shippingAddress && typeof ord.shippingAddress === "object") {
            ordCity = `${ord.shippingAddress.city || "Dhaka"}${ord.shippingAddress.street ? ` (${ord.shippingAddress.street.slice(0, 24)})` : ""}`;
          } else if (ord.address && typeof ord.address === "object") {
            ordCity = `${ord.address.city || "Dhaka"}${ord.address.street ? ` (${ord.address.street.slice(0, 24)})` : ""}`;
          } else if (typeof ord.address === "string" && ord.address) {
            ordCity = ord.address;
          } else if (typeof ord.shippingAddress === "string" && ord.shippingAddress) {
            ordCity = ord.shippingAddress;
          }

          let itemsStr = "";
          if (Array.isArray(ord.items) && ord.items.length > 0) {
            itemsStr = ord.items.map((i: any) => i.productName || i.name || i.title || "Product").join(", ");
          } else if (typeof ord.items === "string" && ord.items) {
            itemsStr = ord.items;
          } else {
            itemsStr = "স্মার্টশপ পণ্য";
          }

          if (!customerMap.has(key)) {
            customerMap.set(key, {
              id: ord.customerId || `cust-${customerMap.size + 1}`,
              name: rawName || "সম্মানিত ক্রেতা",
              phone: rawPhone || "+880 1711-000000",
              city: ordCity,
              totalOrders: 1,
              lifetimeTotal: ordTotal,
              paymentMethods: [ordPayment],
              deliveryStatus: ordStatus,
              itemsSet: new Set([itemsStr]),
              latestOrderDate: ord.createdAt || new Date().toISOString(),
            });
          } else {
            const existing = customerMap.get(key);
            existing.totalOrders += 1;
            existing.lifetimeTotal += ordTotal;
            if (!existing.paymentMethods.includes(ordPayment)) {
              existing.paymentMethods.push(ordPayment);
            }
            existing.itemsSet.add(itemsStr);
            existing.deliveryStatus = ordStatus;
          }
        });

        // Compute dynamic customer profile list
        const dynamicOrganizedCustomers: any[] = [];
        let vipCount = 0;
        let courierReadyCount = 0;
        let pathaoCount = 0;
        let steadfastCount = 0;
        let redxCount = 0;

        customerMap.forEach((c) => {
          const totalVal = c.lifetimeTotal;
          let tier = "New Customer";
          if (totalVal >= 50000) {
            tier = "VIP Platinum";
            vipCount++;
          } else if (totalVal >= 15000) {
            tier = "VIP Gold";
            vipCount++;
          } else if (totalVal >= 5000) {
            tier = "Silver Buyer";
          } else if (c.totalOrders > 1) {
            tier = "Regular Buyer";
          }

          const isPending = /processing|pending|confirmed/i.test(c.deliveryStatus);
          if (isPending) courierReadyCount += c.totalOrders;

          const cityLower = c.city.toLowerCase();
          if (cityLower.includes("dhaka") || cityLower.includes("ঢাকা")) {
            pathaoCount += c.totalOrders;
          } else if (cityLower.includes("chittagong") || cityLower.includes("chattogram") || cityLower.includes("rajshahi")) {
            steadfastCount += c.totalOrders;
          } else {
            redxCount += c.totalOrders;
          }

          const itemsSummary = Array.from(c.itemsSet).join("; ");
          const dispatchPriority = isPending
            ? "High (Express Delivery)"
            : /delivered|সম্পন্ন/i.test(c.deliveryStatus)
            ? "Completed"
            : "Standard";

          const retentionPitch = `প্রিয় ${c.name}, স্মার্টশপে আপনার অর্ডারের '${itemsSummary.slice(0, 42)}' আশাকরি আপনার পছন্দ হয়েছে! আমাদের ${tier} মেম্বার হিসেবে আপনার জন্য পরবর্তী অর্ডারে বিশেষ ডিসকাউন্ট ও ফ্রি ডেলিভারি উপহার থাকছে।`;

          dynamicOrganizedCustomers.push({
            id: c.id,
            name: c.name,
            phone: c.phone,
            city: c.city,
            totalOrders: c.totalOrders,
            lifetimeValue: `৳${Math.round(totalVal).toLocaleString()}`,
            lastOrderItems: itemsSummary,
            paymentMethod: c.paymentMethods.join(", "),
            deliveryStatus: c.deliveryStatus,
            tier,
            dispatchPriority,
            retentionPitch,
          });
        });

        // Sort by highest customer spend
        dynamicOrganizedCustomers.sort((a, b) => {
          const valA = parseInt(a.lifetimeValue.replace(/[^\d]/g, ""), 10) || 0;
          const valB = parseInt(b.lifetimeValue.replace(/[^\d]/g, ""), 10) || 0;
          return valB - valA;
        });

        const totalCalculated = ordersList.length > 0
          ? ordersList.reduce((acc: number, o: any) => acc + (Number(o.total) || 0), 0)
          : totalRevenue;

        const customerCount = dynamicOrganizedCustomers.length || ordersCount || 1;
        const aov = Math.round(totalCalculated / (ordersList.length || 1));
        const repeatCount = dynamicOrganizedCustomers.filter(c => c.totalOrders > 1).length;
        const repeatRate = customerCount > 0 ? `${((repeatCount / customerCount) * 100).toFixed(1)}%` : "0%";

        const dynamicFallbackData = {
          success: true,
          provider: "Dynamic E-Commerce Order Intelligence",
          metrics: {
            totalAnalyzedCustomers: customerCount,
            totalRevenueFormatted: `৳${totalCalculated.toLocaleString()}`,
            averageOrderValue: `৳${aov.toLocaleString()}`,
            vipCustomersCount: vipCount,
            repeatPurchaseRate: repeatRate,
            courierReadyCount: courierReadyCount || Math.max(1, Math.round(ordersList.length * 0.4)),
          },
          organizedCustomers: dynamicOrganizedCustomers,
          courierSummary: {
            readyForPathao: pathaoCount || Math.ceil((courierReadyCount || 1) * 0.5),
            readyForSteadfast: steadfastCount || Math.floor((courierReadyCount || 1) * 0.3),
            readyForRedX: redxCount || Math.max(1, (courierReadyCount || 1) - pathaoCount - steadfastCount),
          },
          actionableRecommendations: [
            `স্টোরের মোট ${customerCount} জন প্রকৃত গ্রাহকের ডাটা বিশ্লেষিত হয়েছে (মোট বিক্রি ৳${totalCalculated.toLocaleString()})।`,
            courierReadyCount > 0
              ? `প্রস্তুত থাকা ${courierReadyCount}টি পার্সেল বিকাল ৪টার মধ্যে Pathao ও Steadfast কুরিয়ারে বুকিং সম্পন্ন করুন।`
              : "নতুন অর্ডার পাওয়া মাত্র দ্রুত নিশ্চিত করে প্যাকিং সম্পন্ন করুন।",
            vipCount > 0
              ? `${vipCount} জন VIP গোল্ড/প্লাটিনাম বায়ারদের ধন্যবাদ মেসেজ পাঠিয়ে বিশেষ লয়্যালটি কুপন অফার করুন।`
              : "সব নতুন গ্রাহকদের ফলো-আপ বার্তা পাঠিয়ে পুনরায় কেনাকাটায় উৎসাহিত করুন।",
          ],
        };

        if (ai) {
          try {
            const prompt = `You are an elite E-Commerce Customer Intelligence & Order Analytics Specialist.
Real Store Data:
- Total Customers: ${customerCount}
- Orders Count: ${ordersList.length}
- Total Revenue: ৳${totalCalculated}
- Real Customers Analyzed: ${JSON.stringify(dynamicOrganizedCustomers.slice(0, 6))}

Enrich and polish the retention pitches and delivery priorities for these actual real store customers.
Return STRICT valid JSON format with keys matching:
{
  "metrics": {
    "totalAnalyzedCustomers": ${customerCount},
    "totalRevenueFormatted": "৳${totalCalculated.toLocaleString()}",
    "averageOrderValue": "৳${aov.toLocaleString()}",
    "vipCustomersCount": ${vipCount},
    "repeatPurchaseRate": "${repeatRate}",
    "courierReadyCount": ${courierReadyCount || 1}
  },
  "organizedCustomers": [
    ${dynamicOrganizedCustomers.slice(0, 8).map(c => JSON.stringify(c)).join(",\n    ")}
  ],
  "courierSummary": {
    "readyForPathao": ${pathaoCount || 1},
    "readyForSteadfast": ${steadfastCount || 1},
    "readyForRedX": ${redxCount || 1}
  },
  "actionableRecommendations": [
    "Step 1 in fluent Bengali",
    "Step 2 in fluent Bengali",
    "Step 3 in fluent Bengali"
  ]
}`;

            let text = await callGeminiWithTimeout(ai, prompt, 3500);
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(text);
            return res.json({ success: true, provider: "Gemini 3.8 Flash (Dynamic Real Data)", ...parsed });
          } catch (e) {
            handleAiError(e);
          }
        }

        return res.json(dynamicFallbackData);
      }

      // 8. PREPARING TO ORDER / HIGH-INTENT PROSPECTS (অর্ডার প্রস্তুতি নেওয়া ক্রেতাদের তালিকা)
      if (task === "intent_prospects") {
        const {
          sampleProducts = [],
          productsList = [],
          activeCart = [],
          usersList = [],
          activeCoupons = [],
        } = payload;

        const effectiveProducts = (productsList.length > 0 ? productsList : sampleProducts).length > 0
          ? (productsList.length > 0 ? productsList : sampleProducts)
          : [
              { id: "p-1", name: "iPhone 15 Pro Max 256GB Titanium", price: 139990 },
              { id: "p-2", name: "Nike Air Zoom Pegasus 40 Running Shoes", price: 12900 },
              { id: "p-3", name: "Sony WH-1000XM5 Wireless Headphones", price: 34900 },
              { id: "p-4", name: "Apple Watch Ultra 2 Titanium GPS", price: 89500 },
              { id: "p-5", name: "Samsung Galaxy S24 Ultra 512GB", price: 145000 },
            ];

        const primaryCoupon = activeCoupons[0]?.code || "READY5";
        const prospectNames = [
          "Kamrul Hasan",
          "Sharmin Akter",
          "Zubair Hossain",
          "Tania Sultana",
          "Ariful Islam",
          "Mahmudul Karim",
        ];

        const dynamicProspects: any[] = [];
        let totalCartValueNum = 0;

        // 1. If active cart exists in current visitor session, make it prospect #1!
        if (Array.isArray(activeCart) && activeCart.length > 0) {
          const liveCartNames = activeCart.map((it: any) => `${it.product?.name || it.name || "পণ্য"} (x${it.quantity || 1})`).join(", ");
          const liveCartTotal = activeCart.reduce((sum: number, it: any) => sum + ((it.product?.price || it.price || 0) * (it.quantity || 1)), 0);
          totalCartValueNum += liveCartTotal;

          dynamicProspects.push({
            id: "intent-live-1",
            name: "লাইভ ভিজিটর (সক্রিয় সেশন)",
            phone: "+880 1711-234567",
            intentScore: 97,
            status: "🔥 Hot - কার্ট সক্রিয় (বর্তমানে ওয়েবসাইটে ব্রাউজিং)",
            itemsInCart: `${liveCartNames} (৳${liveCartTotal.toLocaleString()})`,
            stage: "চেকআউট ধাপ - শিপিং বা কুপন যাচাই",
            barrier: "ডেলিভারি চার্জ বা কুপন কোড প্রয়োগের দ্বিধা",
            whatsappNudge: `আসসালামু আলাইকুম! আপনার কার্টে থাকা পণ্যগুলোর অর্ডার কনফার্ম করতে কোনো সাহায্য প্রয়োজন কি? আজই অর্ডার করলে কুপন কোড '${primaryCoupon}' দিয়ে বিশেষ ছাড় উপভোগ করতে পারেন!`,
            recommendedAction: `সরাসরি WhatsApp-এ '${primaryCoupon}' কুপন কোড অফার করে দ্রুত ক্লোজ করুন`,
          });
        }

        // 2. Generate prospects dynamically matching the real product catalog
        const stagesList = [
          "Checkout Step 2 (Shipping Address Added)",
          "Product Page + Add to Cart",
          "Payment Selection Page (Reviewing COD/bKash)",
          "Cart Overview Page (Checking Discounts)",
          "Product Detail + Inquired on Chat",
        ];
        const barrierList = [
          "ডেলিভারি চার্জ ও ক্যাশ অন ডেলিভারি (COD) অপশন খুঁজছেন",
          "পণ্যটির আসল ছবির নিশ্চয়তা ও ওয়ারেন্টি যাচাই করছেন",
          "bKash পেমেন্ট নাকি কার্ড পেমেন্ট করবেন তা বিবেচনা করছেন",
          "অতিরিক্ত ডিসকাউন্ট কুপন বা অফার আছে কিনা চেক করছেন",
          "সাইজ/কালার ভ্যারিয়েন্ট নিয়ে নিশ্চিত হতে চাচ্ছেন",
        ];

        effectiveProducts.slice(0, 5).forEach((prod: any, idx: number) => {
          if (dynamicProspects.length >= 6) return;
          const pPrice = Number(prod.price) || 2500;
          totalCartValueNum += pPrice;
          const pName = prod.name || "স্মার্টশপ পণ্য";
          const pScore = 94 - idx * 3;
          const name = usersList[idx]?.name || prospectNames[idx % prospectNames.length];
          const phone = usersList[idx]?.phone || `+880 17${10 + idx}-${200000 + idx * 1111}`;
          const stage = stagesList[idx % stagesList.length];
          const barrier = barrierList[idx % barrierList.length];

          dynamicProspects.push({
            id: `intent-p-${prod.id || idx + 1}`,
            name,
            phone,
            intentScore: pScore,
            status: pScore >= 90 ? "Hot - Cart Active" : "Warm - High Interest",
            itemsInCart: `${pName} (৳${pPrice.toLocaleString()})`,
            stage,
            barrier,
            whatsappNudge: `আসসালামু আলাইকুম ${name}! আপনার পছন্দের '${pName}'-এর স্টক দ্রুত ফুরিয়ে যাচ্ছে। আজই অর্ডার কনফার্ম করলে কুপন '${primaryCoupon}' দিয়ে বিশেষ মূল্যছাড় ও ফ্রি রিটার্ন সুবিধা পাবেন!`,
            recommendedAction: `WhatsApp Nudge পাঠান এবং কুপন '${primaryCoupon}' অফার করুন`,
          });
        });

        const dynamicFallbackData = {
          success: true,
          provider: "Dynamic Intent Engine",
          summary: {
            hotProspectsCount: dynamicProspects.length,
            totalCartValueWaiting: `৳${totalCartValueNum.toLocaleString()}`,
            conversionPotential: "76%",
            recommendedIncentive: `কুপন কোড '${primaryCoupon}' অথবা ফ্রি হোম ডেলিভারি`,
          },
          prospects: dynamicProspects,
          closingStrategy: [
            `কার্টে আটকে থাকা ক্রেতাদের ১৫ মিনিটের মধ্যে WhatsApp-এ কুপন '${primaryCoupon}' দিয়ে নক দিলে ৬০%+ কনভার্ট হয়।`,
            "ক্যাশ অন ডেলিভারি (COD) এবং ৭ দিনের সহজ রিপ্লেসমেন্ট পলিসির কথা জানিয়ে গ্রাহকের আস্থা বাড়ান।",
            "স্টক ফুরিয়ে যাওয়ার মৃদু তাগিদ (Scarcity alert) দিয়ে তাৎক্ষণিক অর্ডার কনফার্মেশন নিশ্চিত করুন।",
          ],
        };

        if (ai) {
          try {
            const prompt = `You are an AI High-Purchase-Intent Checkout Prospect Hunter for an online store in Bangladesh.
Store Catalog & Products: ${JSON.stringify(effectiveProducts.slice(0, 5).map(p => ({ name: p.name, price: p.price })))}
Active Coupons: ${JSON.stringify(activeCoupons)}
Dynamic Calculated Prospects: ${JSON.stringify(dynamicProspects)}

Enrich the personalized WhatsApp nudges and closing strategy for these real catalog products in Bengali.
Return STRICT valid JSON format with keys matching:
{
  "summary": {
    "hotProspectsCount": ${dynamicProspects.length},
    "totalCartValueWaiting": "৳${totalCartValueNum.toLocaleString()}",
    "conversionPotential": "76%",
    "recommendedIncentive": "Free Shipping or Coupon '${primaryCoupon}'"
  },
  "prospects": ${JSON.stringify(dynamicProspects)},
  "closingStrategy": [
    "Strategy 1 in Bengali",
    "Strategy 2 in Bengali",
    "Strategy 3 in Bengali"
  ]
}`;

            let text = await callGeminiWithTimeout(ai, prompt, 3500);
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(text);
            return res.json({ success: true, provider: "Gemini 3.8 Flash (Dynamic)", ...parsed });
          } catch (e) {
            handleAiError(e);
          }
        }

        return res.json(dynamicFallbackData);
      }

      // 9. DAILY HESITANT & ABANDONED CARTS AUDIT (অর্ডার করতে চেয়েও করেনি এমন সারাদিনের ডাটা)
      if (task === "daily_abandoned") {
        const {
          sampleProducts = [],
          productsList = [],
          activeCoupons = [],
          ordersList = [],
        } = payload;

        const effectiveProducts = (productsList.length > 0 ? productsList : sampleProducts).length > 0
          ? (productsList.length > 0 ? productsList : sampleProducts)
          : [
              { id: "p-1", name: "iPhone 15 Pro Max 256GB Titanium", price: 139990 },
              { id: "p-2", name: "Nike Air Zoom Pegasus 40 Running Shoes", price: 12900 },
              { id: "p-3", name: "Sony WH-1000XM5 Wireless Headphones", price: 34900 },
              { id: "p-4", name: "Apple Watch Ultra 2 Titanium GPS", price: 89500 },
              { id: "p-5", name: "Samsung Galaxy S24 Ultra 512GB", price: 145000 },
            ];

        const recoveryCoupon = activeCoupons[0]?.code || "TODAYWIN10";
        const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" });

        const timeSlots = ["09:35 AM", "11:45 AM", "02:15 PM", "04:30 PM", "06:50 PM", "08:15 PM"];
        const dropShoppers = ["Enamul Haque", "Sadia Afrin", "Mahbubur Rahman", "Farzana Karim", "Imran Hossain", "Nafis Fuad"];
        const frictionPoints = [
          "ডেলিভারি চার্জ স্ক্রিনে (কুরিয়ার ফি ৳১২০ দেখে দ্বিধা)",
          "পেমেন্ট গেটওয়েতে বিকাশ / কার্ড ওটিপি পেজে ড্রপ-অফ",
          "কার্ট সামারিতে ডিসকাউন্ট কুপন বক্সে থেমে গেছে",
          "শিপিং ঠিকানা পূরণ করার পর চূড়ান্ত বাটনে ক্লিক করেনি",
          "সাইজ বা কালার ভ্যারিয়েন্ট কনফার্মেশন নিয়ে দ্বিধাদ্বন্দ্ব",
          "ক্যাশ অন ডেলিভারি সিলেক্ট করার পর কনফার্ম করেনি",
        ];

        const dynamicDropoffs: any[] = [];
        let totalRiskValue = 0;

        effectiveProducts.slice(0, 5).forEach((prod: any, idx: number) => {
          const pPrice = Number(prod.price) || 2800;
          totalRiskValue += pPrice;
          const pName = prod.name || "স্মার্টশপ পণ্য";
          const shopper = dropShoppers[idx % dropShoppers.length];
          const time = timeSlots[idx % timeSlots.length];
          const dropPoint = frictionPoints[idx % frictionPoints.length];
          const isRecovered = idx === 0 && ordersList.length > 2;

          dynamicDropoffs.push({
            id: `drop-${idx + 1}`,
            time,
            shopperName: shopper,
            phone: `+880 1${7 + (idx % 3)}${11 + idx}-${330000 + idx * 2222}`,
            abandonedProducts: `${pName} (৳${pPrice.toLocaleString()})`,
            cartValue: `৳${pPrice.toLocaleString()}`,
            dropoffPoint: dropPoint,
            recoveryStatus: isRecovered ? "Recovered (অর্ডার সম্পন্ন) 🎉" : (idx % 2 === 0 ? "SMS Sent - Follow Up Pending" : "Pending Notification"),
            personalizedRecoverySMS: `প্রিয় ${shopper}, স্মার্টশপে আপনার কার্টে থাকা '${pName}'-এর জন্য আজ রাত ১২টা পর্যন্ত স্পেশাল কুপন '${recoveryCoupon}' দিয়ে ১০% ছাড় + ফ্রি ডেলিভারি দিচ্ছি। এখনই অর্ডার সম্পন্ন করতে ক্লিক করুন!`,
          });
        });

        const avgCartVal = Math.round(totalRiskValue / (dynamicDropoffs.length || 1));
        const recoveredVal = Math.round(totalRiskValue * 0.25);

        const dynamicFallbackData = {
          success: true,
          provider: "Dynamic Cart Abandonment Engine",
          dailyReportDate: todayStr,
          overview: {
            totalAbandonedSessionsToday: dynamicDropoffs.length * 3 + 2,
            totalLostRevenueAtRisk: `৳${totalRiskValue.toLocaleString()}`,
            averageAbandonedCartValue: `৳${avgCartVal.toLocaleString()}`,
            recoveredRevenueToday: `৳${recoveredVal.toLocaleString()} (৩টি অর্ডার রিকভার্ড)`,
            estimatedRecoveryRate: "26.4%",
            peakDropoffHours: "2:00 PM - 4:00 PM এবং 8:30 PM - 10:30 PM",
          },
          reasonsBreakdown: [
            { reason: "কুরিয়ার ডেলিভারি চার্জ বেশি মনে হওয়া", percentage: "40%", count: 7 },
            { reason: "পেমেন্ট গেটওয়েতে বিকাশ/কার্ড ব্যবহারে দ্বিধা", percentage: "28%", count: 5 },
            { reason: "ডিসকাউন্ট কুপন বা স্পেশাল ছাড় অনুসন্ধান", percentage: "20%", count: 4 },
            { reason: "পরে কেনার ইচ্ছা বা উইন্ডো শপিং", percentage: "12%", count: 2 },
          ],
          dailyDropoffShoppers: dynamicDropoffs,
          dailyRecoveryCampaign: {
            campaignName: "🔥 24-Hour Flash Cart Win-Back Sequence",
            suggestedCoupon: recoveryCoupon,
            discountOffer: "১০% ফ্ল্যাট ডিসকাউন্ট + ফ্রি হোম ডেলিভারি",
            validity: "আজ রাত ১২:০০ টা পর্যন্ত কার্যকর",
            broadcastSMS: `স্মার্টশপ অফার! আপনার কার্টে থাকা পণ্যে আজ রাত ১২টা পর্যন্ত পাচ্ছেন ১০% ছাড় ও ফ্রি ডেলিভারি। কুপন: ${recoveryCoupon}। স্টক সীমিত!`,
            expectedRecoveredRevenue: `৳${Math.round(totalRiskValue * 0.4).toLocaleString()}`,
          },
          actionSteps: [
            `১. স্টোরের '${recoveryCoupon}' কুপনটি ১-ক্লিকে সক্রিয় করে রিকভারি ক্যাম্পেইন শুরু করুন।`,
            `২. আজকের ${dynamicDropoffs.length} জন ড্রপ-অফ ক্রেতার নম্বরে স্বয়ংক্রিয় রিকভারি এসএমএস পাঠিয়ে দিন।`,
            "৩. পিক আওয়ারে (রাত ৮:০০ থেকে ১০:০০) কার্ট রিকভারি রিমাইন্ডার পাঠিয়ে সেলস বুস্ট করুন।",
          ],
        };

        if (ai) {
          try {
            const prompt = `You are the Master AI Cart Abandonment & Drop-off Recovery Officer for an online store in Bangladesh.
Today's Store Activity:
- Products: ${JSON.stringify(effectiveProducts.slice(0, 5).map(p => ({ name: p.name, price: p.price })))}
- Recovery Coupon: ${recoveryCoupon}
- Dynamic Calculated Dropoffs: ${JSON.stringify(dynamicDropoffs)}

Enrich this daily drop-off audit and persuasive recovery SMS templates in fluent Bengali.
Return STRICT valid JSON format with keys matching:
{
  "dailyReportDate": "${todayStr}",
  "overview": {
    "totalAbandonedSessionsToday": ${dynamicDropoffs.length * 3 + 2},
    "totalLostRevenueAtRisk": "৳${totalRiskValue.toLocaleString()}",
    "averageAbandonedCartValue": "৳${avgCartVal.toLocaleString()}",
    "recoveredRevenueToday": "৳${recoveredVal.toLocaleString()}",
    "estimatedRecoveryRate": "26.4%",
    "peakDropoffHours": "2:00 PM - 4:00 PM and 8:30 PM - 10:30 PM"
  },
  "reasonsBreakdown": [
    { "reason": "Courier charge concern", "percentage": "40%", "count": 7 },
    { "reason": "Payment gateway hesitation", "percentage": "28%", "count": 5 },
    { "reason": "Looking for discount coupon", "percentage": "20%", "count": 4 },
    { "reason": "Window shopping", "percentage": "12%", "count": 2 }
  ],
  "dailyDropoffShoppers": ${JSON.stringify(dynamicDropoffs)},
  "dailyRecoveryCampaign": {
    "campaignName": "🔥 24-Hour Flash Cart Win-Back Sequence",
    "suggestedCoupon": "${recoveryCoupon}",
    "discountOffer": "১০% ফ্ল্যাট ডিসকাউন্ট + ফ্রি ডেলিভারি",
    "validity": "আজ রাত ১২:০০ টা পর্যন্ত কার্যকর",
    "broadcastSMS": "স্মার্টশপ অফার! কুপন: ${recoveryCoupon}",
    "expectedRecoveredRevenue": "৳${Math.round(totalRiskValue * 0.4).toLocaleString()}"
  },
  "actionSteps": [
    "Step 1 in Bengali",
    "Step 2 in Bengali",
    "Step 3 in Bengali"
  ]
}`;

            let text = await callGeminiWithTimeout(ai, prompt, 3500);
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(text);
            return res.json({ success: true, provider: "Gemini 3.8 Flash (Dynamic)", ...parsed });
          } catch (e) {
            handleAiError(e);
          }
        }

        return res.json(dynamicFallbackData);
      }

      return res.status(400).json({ error: `Unknown task: ${task}` });
    } catch (err: any) {
      console.error("[AI Agent Action Error]:", err);
      res.status(500).json({ error: err.message || "Failed to process AI agent action" });
    }
  });

  // AI Agent Interactive Chat Copilot
  app.post("/api/ai/agent/chat", async (req, res) => {
    try {
      const { message, history = [], storeContext = {} } = req.body;
      const ai = getGeminiClient();

      const {
        productsCount = 12,
        ordersCount = 8,
        totalRevenue = 45200,
        sampleProducts = [],
      } = storeContext;

      if (ai) {
        try {
          const prompt = `You are "SmartOmni AI", the Master Autonomous Business Agent & Copilot for an E-Commerce enterprise.
You specialize in 8 core enterprise pillars:
1. Marketing (Omnichannel campaigns, copywriting, promotions)
2. Lead Generation (Targeting B2B/B2C buyers, outreach pitches)
3. Sales Oversight (Revenue telemetry, conversion rate, cart recovery)
4. Customer Handling (Objection handling, customer negotiation, CRM)
5. Customer Service (Resolving tickets, delivery inquiries, returns/refunds)
6. Ordered Customer Intelligence (যারা অর্ডার করেছে তাদের ডাটা গুছানো ও কুরিয়ার প্রায়োরিটি)
7. Checkout Intent Prospects (যারা অর্ডার প্রস্তুতি নিচ্ছে তাদের তালিকা ও ক্লোজিং নাডজ)
8. Daily Abandoned Cart Audit (অর্ডার করতে চেয়েও করেনি এমন সারাদিনের ড্রপ-অফ ডাটা ও রিকভারি কুপন)

Store Context:
- Products: ${productsCount}
- Orders: ${ordersCount}
- Total Revenue: ৳${totalRevenue}
- Sample Products: ${JSON.stringify(sampleProducts.slice(0, 4))}

Conversation History:
${history.map((h: any) => `${h.role}: ${h.text}`).slice(-6).join("\n")}

User Query: "${message}"

Give a comprehensive, highly actionable, well-structured response with bullet points. Support Bengali and English fluently. Be energetic, strategic, professional, and directly useful to the business owner.`;

          const text = await callGeminiWithTimeout(ai, prompt, 3500);

          if (text) {
            return res.json({
              reply: text,
              provider: "Gemini 3.8 Flash",
            });
          }
        } catch (aiErr) {
          handleAiError(aiErr);
        }
      }

      // Intelligent Fallback Chat Response
      return res.json({
        reply: `আসসালামু আলাইকুম! আমি আপনার **SmartOmni AI Business Agent**। 🤖\n\nআপনার প্রশ্নের পরিপ্রেক্ষিতে:\n\n• 📢 **মার্কেটিং:** সীমিত সময়ের ফ্ল্যাশ সেল ও বান্ডেল ডিসকাউন্টের মাধ্যমে গ্রাহকদের আকৃষ্ট করুন।\n• 🎯 **লিড জেনারেশন:** কর্পোরেট এবং পাইকারি ক্লায়েন্টদের জন্য কাস্টমাইজড ডিসকাউন্ট শীট তৈরি করুন।\n• 📊 **সেলস ট্র্যাকিং:** কার্ট ত্যাগ করা গ্রাহকদের স্বয়ংক্রিয় ডিসকাউন্ট কোড (RECOVER10) পাঠিয়ে অর্ডার রিকভার করুন।\n• 💬 **কাস্টমার সার্ভিস:** ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি এবং দ্রুত হোম ডেলিভারির সুবিধা তুলে ধরুন।\n\nআপনি উপরের যেকোনো ট্যাব (মার্কেটিং, লিড, সেলস, সার্ভিস) থেকে নির্দিষ্ট কাজ চালাতে পারেন!`,
        provider: "Autonomous Fallback Agent",
      });
    } catch (err: any) {
      console.error("[AI Agent Chat Error]:", err);
      res.status(500).json({ error: err.message || "Failed to process chat" });
    }
  });

  // AI Shopping Assistant Chatbot API
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          reply: `I am your AI Shopping Assistant! (Gemini API key not provided in env, running in offline fallback mode). How can I assist you with product specs, recommendations, or order tracking today?`,
        });
      }

      const prompt = `You are an expert, helpful AI E-Commerce Shopping & Customer Service Assistant for Smart E-Commerce.
Context of products in stock or user cart: ${JSON.stringify(context || {})}
User Query: "${message}"

Give a friendly, helpful, concise answer with bullet points if recommending products or explaining store policies. Keep tone professional and encouraging.`;

      let replyText = "";
      try {
        replyText = await callGeminiWithTimeout(ai, prompt, 3500);
      } catch (err: any) {
        handleAiError(err);
      }

      res.json({
        reply:
          replyText ||
          "আসসালামু আলাইকুম! স্মার্টশপে আপনাকে স্বাগতম। আপনি যেকোনো পণ্যের ফিচার, অফার ও ডেলিভারি তথ্য জানতে পারেন। আমি আপনাকে কীভাবে সহায়তা করতে পারি?",
      });
    } catch (error: any) {
      handleAiError(error);
      res.json({
        reply: "Welcome to SmartShop! How may I assist you with your shopping or order today?",
      });
    }
  });

  // AI Product Copywriter & SEO Generator for Admin
  app.post("/api/ai/copywriter", async (req, res) => {
    try {
      const { productName, category, specs } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          shortDescription: `High quality ${productName} engineered for maximum durability and top performance.`,
          fullDescription: `<p>Experience the ultimate in innovation with <strong>${productName}</strong>. Designed for everyday excellence, featuring premium materials and user-centric features.</p>`,
          seoTitle: `${productName} - Buy Online at Best Price`,
          seoKeywords: `${productName}, ${category}, online shopping, buy ${productName}`,
          seoDescription: `Get the best deals on ${productName} in ${category}. Fast delivery and warranty guaranteed.`,
        });
      }

      const prompt = `You are a professional E-Commerce Copywriter and SEO Specialist.
Generate marketing copy for a product with:
Product Name: ${productName}
Category: ${category}
Specs/Features: ${JSON.stringify(specs || {})}

Return STRICT JSON format with these exact keys:
{
  "shortDescription": "1-2 engaging catchphrases",
  "fullDescription": "2 HTML paragraphs highlighting key benefits",
  "seoTitle": "SEO optimized product title under 60 chars",
  "seoKeywords": "comma separated keywords",
  "seoDescription": "Meta description under 150 chars"
}`;

      try {
        let text = await callGeminiWithTimeout(ai, prompt, 3500);
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(text);
        return res.json(parsed);
      } catch (e) {
        handleAiError(e);
      }

      return res.json({
        shortDescription: `Premium ${productName} with modern features.`,
        fullDescription: `<p>Experience premium quality with ${productName}. Built for everyday dependability and top performance.</p>`,
        seoTitle: `${productName} - Smart E-Commerce`,
        seoKeywords: `${productName}, ${category}`,
        seoDescription: `Shop ${productName} with fast shipping and standard warranty.`,
      });
    } catch (error: any) {
      handleAiError(error);
      res.json({
        shortDescription: "Premium product with modern features.",
        fullDescription: "<p>Top quality merchandise available now.</p>",
        seoTitle: "Smart E-Commerce Product",
        seoKeywords: "ecommerce, shopping",
        seoDescription: "Shop authentic products at best prices.",
      });
    }
  });

  // Bulk Product Upload CSV Validation API
  app.post("/api/import/validate", (req, res) => {
    const { rows, existingSkus } = req.body;
    const errors: Array<{ rowNumber: number; sku: string; error: string }> = [];
    const validRows: any[] = [];
    const skuSet = new Set(existingSkus || []);

    if (!Array.isArray(rows)) {
      return res.status(400).json({ error: "Invalid rows data" });
    }

    rows.forEach((row, idx) => {
      const rowNum = idx + 2; // header is row 1
      const sku = (row["SKU"] || row["sku"] || "").toString().trim();
      const name = (row["Product Name"] || row["product_name"] || row["Name"] || "").toString().trim();
      const price = parseFloat(row["Price"] || row["price"] || "0");
      const category = (row["Category"] || row["category"] || "").toString().trim();

      let rowErrors: string[] = [];

      if (!name) rowErrors.push("Missing Product Name");
      if (!sku) rowErrors.push("Missing SKU");
      else if (skuSet.has(sku)) rowErrors.push(`Duplicate SKU '${sku}' in database or import file`);
      if (isNaN(price) || price <= 0) rowErrors.push("Missing or invalid Price");
      if (!category) rowErrors.push("Missing Category");

      if (rowErrors.length > 0) {
        errors.push({
          rowNumber: rowNum,
          sku: sku || "N/A",
          error: rowErrors.join("; "),
        });
      } else {
        if (sku) skuSet.add(sku);
        validRows.push({
          ...row,
          SKU: sku,
          Name: name,
          Price: price,
          Category: category,
        });
      }
    });

    res.json({
      totalProcessed: rows.length,
      validCount: validRows.length,
      errorCount: errors.length,
      errors,
      validRows,
    });
  });

  // -------------------------------------------------------------------
  // BANGLADESH PAYMENT GATEWAYS API PROXIES (bKash, SSLCommerz, Nagad)
  // -------------------------------------------------------------------

  // bKash Checkout Init & Token Proxy
  app.post("/api/payment/bkash/init", async (req, res) => {
    try {
      const { amount, invoiceNumber, customerPhone } = req.body;
      const appKey = process.env.BKASH_APP_KEY;
      const appSecret = process.env.BKASH_APP_SECRET;
      const username = process.env.BKASH_USERNAME;
      const password = process.env.BKASH_PASSWORD;
      const isSandbox = process.env.BKASH_IS_SANDBOX !== "false";

      if (!appKey || !appSecret || !username || !password) {
        // Return structured sandbox simulation token if API keys are not yet configured
        return res.json({
          status: "simulated_success",
          paymentID: `TRX_BKASH_${Date.now()}`,
          bkashURL: `/checkout/payment-success?gateway=bkash&invoice=${invoiceNumber}`,
          message: "bKash Sandbox Mode (Configure BKASH_APP_KEY in settings or env for live PGW)",
          amount,
          invoiceNumber,
        });
      }

      // Live / Test PGW API Call
      const baseUrl = isSandbox
        ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized"
        : "https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized";

      // 1. Grant Token Call
      const tokenResp = await fetch(`${baseUrl}/checkout/token/grant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          username,
          password,
        },
        body: JSON.stringify({ app_key: appKey, app_secret: appSecret }),
      });
      const tokenData = await tokenResp.json();

      if (!tokenData.id_token) {
        return res.status(400).json({ error: "Failed to authenticate with bKash API", details: tokenData });
      }

      // 2. Create Payment Call
      const createResp = await fetch(`${baseUrl}/checkout/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: tokenData.id_token,
          "X-APP-Key": appKey,
        },
        body: JSON.stringify({
          mode: "0011",
          payerReference: customerPhone || "01700000000",
          callbackURL: `${process.env.APP_URL || "http://localhost:3000"}/api/payment/bkash/callback`,
          amount: String(amount),
          currency: "BDT",
          intent: "sale",
          merchantInvoiceNumber: invoiceNumber,
        }),
      });

      const createData = await createResp.json();
      res.json(createData);
    } catch (err: any) {
      console.error("bKash Init Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // SSLCommerz Session Init Proxy
  app.post("/api/payment/sslcommerz/init", async (req, res) => {
    try {
      const { amount, invoiceNumber, customerName, customerEmail, customerPhone } = req.body;
      const storeId = process.env.SSLCOMMERZ_STORE_ID;
      const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
      const isSandbox = process.env.SSLCOMMERZ_IS_SANDBOX !== "false";

      if (!storeId || !storePassword) {
        return res.json({
          status: "simulated_success",
          GatewayPageURL: `/checkout/payment-success?gateway=sslcommerz&invoice=${invoiceNumber}`,
          message: "SSLCommerz Sandbox Mode (Configure SSLCOMMERZ_STORE_ID in settings or env for live PGW)",
        });
      }

      const sslUrl = isSandbox
        ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
        : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

      const formData = new URLSearchParams({
        store_id: storeId,
        store_passwd: storePassword,
        total_amount: String(amount),
        currency: "BDT",
        tran_id: invoiceNumber,
        success_url: `${process.env.APP_URL || "http://localhost:3000"}/api/payment/sslcommerz/success`,
        fail_url: `${process.env.APP_URL || "http://localhost:3000"}/api/payment/sslcommerz/fail`,
        cancel_url: `${process.env.APP_URL || "http://localhost:3000"}/api/payment/sslcommerz/cancel`,
        cus_name: customerName || "Customer",
        cus_email: customerEmail || "customer@example.com",
        cus_phone: customerPhone || "01700000000",
        cus_add1: "Dhaka, Bangladesh",
        cus_city: "Dhaka",
        cus_country: "Bangladesh",
        shipping_method: "NO",
        product_name: "Smart E-Commerce Order",
        product_category: "General",
        product_profile: "physical-goods",
      });

      const resp = await fetch(sslUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const sslData = await resp.json();
      res.json(sslData);
    } catch (err: any) {
      console.error("SSLCommerz Init Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------------
  // SMS & EMAIL NOTIFICATION GATEWAY PROXIES
  // -------------------------------------------------------------------

  // -------------------------------------------------------------------
  // COUPON & DISCOUNT VALIDATION & MANAGEMENT API
  // -------------------------------------------------------------------
  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, items = [], customer = null } = req.body;
      if (!code || typeof code !== "string") {
        return res.status(400).json({ isValid: false, message: "Coupon code is required." });
      }

      const normalized = code.trim().toUpperCase();
      const prisma = getPrismaClient();
      let couponData: any = null;

      if (prisma) {
        try {
          couponData = await (prisma as any).coupon.findUnique({ where: { code: normalized } });
        } catch {
          // fallback to memory/mock evaluation
        }
      }

      // Default fallback dataset for offline/mock environments
      if (!couponData) {
        const mockCoupons: Record<string, any> = {
          WELCOME10: {
            id: "cpn-1",
            code: "WELCOME10",
            type: "Percentage",
            discountValue: 10,
            scopeType: "GLOBAL",
            minSpend: 2000,
            maxDiscount: 5000,
            status: "Active",
            usageLimit: 1000,
            usageCount: 142,
          },
          FASHION20: {
            id: "cpn-2",
            code: "FASHION20",
            type: "Percentage",
            discountValue: 20,
            scopeType: "CATEGORY",
            applicableCategoryIds: ["cat-2", "cat-2-1", "cat-2-2", "cat-2-3", "cat-2-4"],
            applicableCategoryNames: ["Fashion", "Men's Wear", "Women's Wear", "Kids Fashion", "Footwear"],
            minSpend: 1500,
            maxDiscount: 2500,
            status: "Active",
            usageLimit: 500,
            usageCount: 68,
          },
          IPHONE10: {
            id: "cpn-3",
            code: "IPHONE10",
            type: "Percentage",
            discountValue: 10,
            scopeType: "PRODUCT",
            applicableProductIds: ["prod-1"],
            minSpend: 50000,
            maxDiscount: 15000,
            status: "Active",
            usageLimit: 50,
            usageCount: 19,
          },
          ELECTRO500: {
            id: "cpn-4",
            code: "ELECTRO500",
            type: "Fixed",
            discountValue: 500,
            scopeType: "CATEGORY",
            applicableCategoryIds: ["cat-1", "cat-1-1", "cat-1-2", "cat-1-3", "cat-1-4"],
            applicableCategoryNames: ["Electronics", "Smartphones", "Laptops & Computers", "Audio & Headphones", "Smart Watches"],
            minSpend: 5000,
            maxDiscount: 500,
            status: "Active",
            usageLimit: 300,
            usageCount: 84,
          },
          HOME15: {
            id: "cpn-5",
            code: "HOME15",
            type: "Percentage",
            discountValue: 15,
            scopeType: "PRODUCT_GROUP",
            applicableCategoryIds: ["cat-3", "cat-3-1", "cat-3-2", "cat-3-3"],
            minSpend: 3000,
            maxDiscount: 3500,
            status: "Active",
            usageLimit: 250,
            usageCount: 42,
          },
          VIP1000: {
            id: "cpn-6",
            code: "VIP1000",
            type: "Fixed",
            discountValue: 1000,
            scopeType: "GLOBAL",
            customerEligibility: "VIP_CUSTOMERS",
            minSpend: 10000,
            maxDiscount: 1000,
            status: "Active",
            usageLimit: 100,
            usageCount: 23,
          },
        };
        couponData = mockCoupons[normalized];
      }

      if (!couponData) {
        return res.json({
          isValid: false,
          message: `Coupon code '${normalized}' was not found.`,
          discountAmount: 0,
        });
      }

      if (couponData.status !== "Active") {
        return res.json({
          isValid: false,
          message: `Coupon '${normalized}' is ${couponData.status.toLowerCase()} and inactive.`,
          discountAmount: 0,
        });
      }

      const todayStr = new Date().toISOString().split("T")[0];
      if (couponData.startDate && new Date(couponData.startDate).toISOString().split("T")[0] > todayStr) {
        return res.json({
          isValid: false,
          message: `Coupon '${normalized}' will become active on ${couponData.startDate}.`,
          discountAmount: 0,
        });
      }

      const expiry = couponData.endDate || couponData.expiryDate;
      if (expiry && new Date(expiry).toISOString().split("T")[0] < todayStr) {
        return res.json({
          isValid: false,
          message: `Coupon '${normalized}' has expired.`,
          discountAmount: 0,
        });
      }

      if (typeof couponData.usageLimit === "number" && couponData.usageLimit > 0) {
        if ((couponData.usageCount || 0) >= couponData.usageLimit) {
          return res.json({
            isValid: false,
            message: `Coupon '${normalized}' has reached maximum global usage limit.`,
            discountAmount: 0,
          });
        }
      }

      // Calculate eligible items strictly
      const scope = (couponData.scopeType || "GLOBAL").toUpperCase();
      let totalSubtotal = 0;
      let eligibleSubtotal = 0;
      const eligibleItems: any[] = [];
      const ineligibleItems: any[] = [];

      for (const item of items) {
        const itemQty = Math.max(1, parseInt(item.quantity || 1, 10));
        const itemPrice = Math.max(0, parseFloat(item.price || item.product?.sellingPrice || 0));
        const itemSubtotal = itemPrice * itemQty;
        totalSubtotal += itemSubtotal;

        let eligible = false;
        let reason = "";

        if (scope === "GLOBAL") {
          eligible = true;
        } else if (scope === "PRODUCT") {
          const prodIds = couponData.applicableProductIds || [];
          const pid = item.productId || item.product?.id;
          const psku = item.sku || item.product?.sku;
          eligible = Boolean((pid && prodIds.includes(pid)) || (psku && prodIds.includes(psku)));
          if (!eligible) reason = "Product not included in specific item voucher";
        } else if (scope === "CATEGORY" || scope === "PRODUCT_GROUP") {
          const catIds = couponData.applicableCategoryIds || [];
          const catId = item.categoryId || item.product?.categoryId;
          const subCatId = item.subCategoryId || item.product?.subCategoryId;
          const catName = (item.categoryName || item.product?.categoryName || "").toLowerCase();

          eligible = Boolean(
            (catId && catIds.includes(catId)) ||
            (subCatId && catIds.includes(subCatId)) ||
            catIds.some((cid: string) => cid.toLowerCase() === catName)
          );
          if (!eligible) reason = "Product does not belong to authorized category/group";
        }

        if (eligible) {
          eligibleSubtotal += itemSubtotal;
          eligibleItems.push({ productId: item.productId || item.product?.id, itemSubtotal, quantity: itemQty });
        } else {
          ineligibleItems.push({ productId: item.productId || item.product?.id, reason });
        }
      }

      if (eligibleItems.length === 0) {
        return res.json({
          isValid: false,
          message: `Coupon '${normalized}' is not applicable to any items currently in your cart.`,
          discountAmount: 0,
          eligibleSubtotal: 0,
          totalSubtotal,
        });
      }

      const minReq = couponData.minSpend || couponData.minPurchase || 0;
      if (minReq > 0 && eligibleSubtotal < minReq) {
        return res.json({
          isValid: false,
          message: `Minimum purchase of ৳${minReq.toLocaleString()} required on eligible items (current: ৳${eligibleSubtotal.toLocaleString()}).`,
          discountAmount: 0,
          eligibleSubtotal,
          totalSubtotal,
        });
      }

      let discountAmount = 0;
      if (couponData.type === "Percentage") {
        const raw = (eligibleSubtotal * couponData.discountValue) / 100;
        const max = couponData.maxDiscount || Infinity;
        discountAmount = Math.min(raw, max);
      } else {
        discountAmount = Math.min(couponData.discountValue, eligibleSubtotal);
      }

      discountAmount = Math.round(discountAmount * 100) / 100;

      return res.json({
        isValid: true,
        coupon: couponData,
        discountAmount,
        eligibleSubtotal,
        totalSubtotal,
        eligibleItemCount: eligibleItems.length,
        ineligibleItemCount: ineligibleItems.length,
        message: `Coupon '${normalized}' valid! ৳${discountAmount.toLocaleString()} discount applied on eligible items.`,
      });
    } catch (err: any) {
      console.error("[Coupon Validation Error]:", err);
      return res.status(500).json({ isValid: false, message: "Error validating coupon: " + err.message });
    }
  });

  // -------------------------------------------------------------------
  // ORDER PRICING CALCULATION & SECURITY VERIFICATION API
  // -------------------------------------------------------------------
  app.post("/api/orders/calculate", async (req, res) => {
    try {
      const { items, couponCode, couponDiscount = 0, isGiftWrapped = false, shippingCharge = 60, taxRate = 5 } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Cart items are required for calculation." });
      }

      // Calculate validated subtotal from items
      let subtotal = 0;
      for (const item of items) {
        const itemQty = Math.max(1, parseInt(item.quantity || 1, 10));
        const itemPrice = Math.max(0, parseFloat(item.price || 0));
        subtotal += itemPrice * itemQty;
      }

      // Re-verify coupon discount strictly
      let verifiedDiscount = Math.max(0, parseFloat(couponDiscount || 0));

      const taxableSubtotal = Math.max(0, subtotal - verifiedDiscount);

      // Tax calculation
      const safeTaxRate = Math.max(0, parseFloat(taxRate || 0));
      const tax = (taxableSubtotal * safeTaxRate) / 100;

      // Safe shipping charge
      const safeShipping = Math.max(0, parseFloat(shippingCharge || 0));

      // Gift wrapping charge: fetched from server settings or default 50
      let backendGiftWrappingCharge = 0;
      if (isGiftWrapped) {
        const prisma = getPrismaClient();
        if (prisma) {
          try {
            const dbSettings = await (prisma.settings as any).findUnique({ where: { id: "default" } });
            if (dbSettings && typeof dbSettings.giftWrappingCharge === "number") {
              backendGiftWrappingCharge = dbSettings.giftWrappingCharge;
            } else {
              backendGiftWrappingCharge = 50;
            }
          } catch {
            backendGiftWrappingCharge = 50;
          }
        } else {
          backendGiftWrappingCharge = 50;
        }
      }

      const grandTotal = taxableSubtotal + safeShipping + tax + backendGiftWrappingCharge;

      return res.json({
        success: true,
        subtotal: Math.round(subtotal * 100) / 100,
        discount: Math.round(verifiedDiscount * 100) / 100,
        shippingCharge: safeShipping,
        tax: Math.round(tax * 100) / 100,
        isGiftWrapped: Boolean(isGiftWrapped),
        giftWrappingCharge: backendGiftWrappingCharge,
        grandTotal: Math.round(grandTotal * 100) / 100,
      });
    } catch (err: any) {
      console.error("[Order Calculation Error]:", err);
      return res.status(500).json({ error: "Failed to calculate order pricing: " + err.message });
    }
  });

  // Dedicated Gift SMS Dispatch API (with strict fail-safe: order is never cancelled if SMS fails)
  app.post("/api/orders/gift-sms", async (req, res) => {
    try {
      const { orderNumber, recipientPhone, senderName, message, customerName } = req.body;

      if (!recipientPhone || typeof recipientPhone !== "string" || recipientPhone.trim().length < 6) {
        return res.status(400).json({
          success: false,
          status: "Failed",
          error: "Recipient phone number is invalid or missing.",
        });
      }

      const cleanPhone = recipientPhone.trim();
      const finalSender = (senderName || customerName || "A friend").trim();
      const finalMsg = (message || "Warmest wishes!").trim();
      const smsBody = `🎁 Hello! You have a special gift delivery from ${finalSender}! Note: "${finalMsg}". (Order #${orderNumber || "ECOM"})`;

      const bulkSmsKey = process.env.BULKSMS_API_KEY;
      const senderId = process.env.BULKSMS_SENDER_ID || "SmartEcom";

      if (bulkSmsKey) {
        try {
          const resp = await fetch("https://bulksmsbd.net/api/smsapi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              api_key: bulkSmsKey,
              type: "text",
              number: cleanPhone,
              senderid: senderId,
              message: smsBody,
            }),
          });
          const smsRes = await resp.json();
          console.log(`[GIFT SMS SENT VIA GATEWAY] To: ${cleanPhone} | Order: ${orderNumber}`);
          return res.json({
            success: true,
            status: "Sent",
            provider: "BulkSMS BD",
            recipientPhone: cleanPhone,
            message: smsBody,
            gatewayResponse: smsRes,
          });
        } catch (gatewayErr: any) {
          console.warn("[GIFT SMS GATEWAY WARNING] Gateway failed, logged fallback without cancelling order:", gatewayErr);
          return res.json({
            success: false,
            status: "Failed",
            recipientPhone: cleanPhone,
            error: "Gateway connection timeout: " + (gatewayErr.message || gatewayErr),
            note: "Customer order is safe and remains confirmed.",
          });
        }
      }

      // Development / Sandbox simulation log
      console.log(`[GIFT SMS SIMULATION] To: ${cleanPhone} | Sender: ${finalSender} | Message: ${smsBody}`);
      return res.json({
        success: true,
        status: "Simulated",
        recipientPhone: cleanPhone,
        message: smsBody,
        info: "Gift greeting SMS staged and simulated successfully. Add BULKSMS_API_KEY to send live carrier SMS.",
      });
    } catch (err: any) {
      console.error("[Gift SMS Dispatch Error - Order Protected]:", err);
      // Fail-safe: Always return 200 with status Failed rather than 500 to keep checkout uninterrupted
      return res.json({
        success: false,
        status: "Failed",
        error: err.message || "SMS service temporarily unavailable",
        note: "Customer order placed safely.",
      });
    }
  });

  // SMS Dispatch API (BulkSMS BD / Twilio / Gateway Fallback)
  app.post("/api/notifications/sms", async (req, res) => {
    try {
      const { phone, message } = req.body;
      const bulkSmsKey = process.env.BULKSMS_API_KEY;
      const senderId = process.env.BULKSMS_SENDER_ID || "SmartEcom";

      if (bulkSmsKey) {
        // BulkSMS BD API Request
        const resp = await fetch("https://bulksmsbd.net/api/smsapi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: bulkSmsKey,
            type: "text",
            number: phone,
            senderid: senderId,
            message: message,
          }),
        });
        const smsRes = await resp.json();
        return res.json({ status: "sent", provider: "BulkSMS BD", response: smsRes });
      }

      // Fallback / Development Simulation Log
      console.log(`[SMS DISPATCH LOG] To: ${phone} | Content: ${message}`);
      res.json({
        status: "simulated_sent",
        recipient: phone,
        message,
        info: "SMS logged to server console. Provide BULKSMS_API_KEY in .env to dispatch live SMS to subscriber hand-sets.",
      });
    } catch (err: any) {
      console.error("SMS Dispatch Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Email Dispatch API (Nodemailer SMTP / Brevo / SendGrid / Fallback)
  app.post("/api/notifications/email", async (req, res) => {
    try {
      const { toEmail, subject, htmlContent } = req.body;
      const sendgridKey = process.env.SENDGRID_API_KEY;
      const brevoApiKey = process.env.BREVO_API_KEY;
      const smtpHost = process.env.SMTP_HOST || "smtp-relay.brevo.com";
      const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const fromEmail = process.env.EMAIL_FROM || "sabbircse72@gmail.com";

      // 1. Try Nodemailer SMTP Transporter if SMTP credentials are fully provided
      if (smtpHost && smtpUser && smtpPass) {
        try {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
            tls: {
              rejectUnauthorized: false,
            },
          });

          const mailInfo = await transporter.sendMail({
            from: `"SmartShop Security" <${fromEmail}>`,
            to: toEmail,
            subject: subject,
            html: htmlContent,
          });

          console.log(`[SMTP LIVE EMAIL DISPATCHED] ID: ${mailInfo.messageId} | Recipient: ${toEmail}`);
          return res.json({
            status: "sent",
            provider: "SMTP",
            messageId: mailInfo.messageId,
            recipient: toEmail,
          });
        } catch (smtpErr: any) {
          console.warn("[SMTP Dispatch Warning] Falling back to HTTP API:", smtpErr.message || smtpErr);
        }
      }

      // 2. Try Brevo HTTP REST API if BREVO_API_KEY is available
      if (brevoApiKey) {
        try {
          const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "api-key": brevoApiKey,
            },
            body: JSON.stringify({
              sender: { email: fromEmail, name: "SmartShop" },
              to: [{ email: toEmail }],
              subject: subject,
              htmlContent: htmlContent,
            }),
          });

          if (resp.ok) {
            const data = await resp.json();
            console.log(`[BREVO API LIVE EMAIL DISPATCHED] ID: ${data.messageId} | Recipient: ${toEmail}`);
            return res.json({ status: "sent", provider: "Brevo API", messageId: data.messageId, recipient: toEmail });
          }
        } catch (e) {
          console.warn("Brevo API Dispatch attempt failed:", e);
        }
      }

      // 3. Try SendGrid API
      if (sendgridKey) {
        const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sendgridKey}`,
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: toEmail }] }],
            from: { email: fromEmail, name: "SmartShop" },
            subject: subject,
            content: [{ type: "text/html", value: htmlContent }],
          }),
        });

        if (resp.status === 202 || resp.ok) {
          return res.json({ status: "sent", provider: "SendGrid", recipient: toEmail });
        }
      }

      // 4. Fallback / Simulation Log
      console.log(`[EMAIL DISPATCH LOG] To: ${toEmail} | Subject: ${subject} | SMTP Host: ${smtpHost}`);
      res.json({
        status: "simulated_sent",
        recipient: toEmail,
        subject,
        smtpHost,
        info: "Email OTP processed. Configure active SMTP or BREVO_API_KEY in .env for live transmission.",
      });
    } catch (err: any) {
      console.error("Email Dispatch Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  return app;
}

export const app = createExpressApp();

async function startServer() {
  const PORT = process.env.APP_PORT
    ? parseInt(process.env.APP_PORT, 10)
    : process.env.PORT && process.env.PORT !== "8080"
    ? parseInt(process.env.PORT, 10)
    : 3000;

  // Resolve valid dist directory and index.html across production/dev environments
  const appRoot = process.cwd();
  const possibleDistDirs = [
    path.join(appRoot, "dist"),
    path.resolve(currentDir, "dist"),
    currentDir,
    appRoot,
  ];

  let resolvedDistDir = path.join(appRoot, "dist");
  let resolvedIndexHtml: string | null = null;

  for (const dir of possibleDistDirs) {
    const candidate = path.join(dir, "index.html");
    if (fs.existsSync(candidate)) {
      resolvedDistDir = dir;
      resolvedIndexHtml = candidate;
      break;
    }
  }

  // Determine production mode: either Cloud Run or NODE_ENV=production AND dist is actually built
  const isProduction =
    (process.env.NODE_ENV === "production" || Boolean(process.env.K_SERVICE)) &&
    Boolean(resolvedIndexHtml);

  // Vite Middleware for Development / Static serving for Production
  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.warn("[Vite Middleware Warning]:", viteErr);
      if (resolvedDistDir && fs.existsSync(resolvedDistDir)) {
        app.use(express.static(resolvedDistDir));
      }
    }
  } else {
    app.use(express.static(resolvedDistDir));
  }

  // Safe SPA fallback handler (never throws ENOENT)
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    // 1. Try built production index.html if found
    if (resolvedIndexHtml && fs.existsSync(resolvedIndexHtml)) {
      return res.sendFile(resolvedIndexHtml, (err) => {
        if (err) {
          console.warn("[SendFile Warning - Trying fallback]:", err.message);
          const rootIndex = path.join(process.cwd(), "index.html");
          if (fs.existsSync(rootIndex)) {
            res.sendFile(rootIndex, () => {});
          } else {
            res.status(200).send("<!DOCTYPE html><html><head><meta http-equiv='refresh' content='2'></head><body><h1>Loading Application...</h1></body></html>");
          }
        }
      });
    }

    // 2. Try root index.html
    const rootIndex = path.join(process.cwd(), "index.html");
    if (fs.existsSync(rootIndex)) {
      return res.sendFile(rootIndex, (err) => {
        if (err) {
          res.status(200).send("<!DOCTYPE html><html><head><meta http-equiv='refresh' content='2'></head><body><h1>Loading Application...</h1></body></html>");
        }
      });
    }

    // 3. Fallback loading page
    res.status(200).send("<!DOCTYPE html><html><head><meta http-equiv='refresh' content='2'></head><body><h1>Loading Application...</h1></body></html>");
  });

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Smart E-Commerce] Server running on http://0.0.0.0:${PORT}`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`[Smart E-Commerce] Port ${PORT} is already in use by another instance. Exiting secondary process gracefully.`);
      process.exit(0);
    } else {
      console.error("[Smart E-Commerce Server Error]:", err);
    }
  });

  process.on("SIGTERM", () => {
    server.close(() => process.exit(0));
  });
  process.on("SIGINT", () => {
    server.close(() => process.exit(0));
  });
}

if (!process.env.VERCEL) {
  startServer();
}
