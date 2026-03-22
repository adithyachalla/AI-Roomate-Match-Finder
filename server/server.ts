// server.ts — top of file (replace the existing top with this block)
import "./config/loadEnv.js"; // load .env before any other modules

import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import connectDB from "./config/db.js";
import { seedDummyUsers, transporter } from "./controllers/authController.js";
import Listing from "./models/Listing.js";
import profileRoutes from "./routes/ProfileRoutes.js";
import authRoutes from "./routes/auth.js";
import messagesRoutes from "./routes/messages.js";
import userRoutes from "./routes/userRoutes.js";

// ESM-safe __filename / __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// place DB_FILE after __dirname is defined
const DB_FILE = path.join(__dirname, "db.json");

// JSON storage for non-listing data (roommates, leads, messages, tenantMatches)
const initDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      roommates: [
        {
          id: 1,
          name: "Sarah Miller",
          bio: "Graduate student at USC. Quiet, focus-oriented, and loves coffee.",
          lifestyle: { cleanliness: "High", noise: "Low", schedule: "Early Bird" },
          avatar_url: "https://picsum.photos/seed/sarah/200/200",
          sync_score: 98
        },
        {
          id: 2,
          name: "Alex Chen",
          bio: "Engineering major. Loves gaming and cooking. Looking for someone social.",
          lifestyle: { cleanliness: "Medium", noise: "Medium", schedule: "Night Owl" },
          avatar_url: "https://picsum.photos/seed/alex/200/200",
          sync_score: 85
        }
      ],
      leads: [
        { id: 1, name: "Marcus Chen", time: "2m ago", property: "Downtown Loft 4B", message: "Hi! Is this still available for August intake? I'm a graduate student..." },
        { id: 2, name: "Sarah Jenkins", time: "1h ago", property: "Greenview Heights", message: "Would love to schedule a virtual tour this Friday if possible." }
      ],
      messages: [
        { id: 1, sender: "Marcus Chen", recipient: "Alex Johnson", text: "Is the security deposit refundable?", time: "10:30 AM", unread: true },
        { id: 2, sender: "Sarah Jenkins", recipient: "Alex Johnson", text: "Thanks for the tour!", time: "Yesterday", unread: false },
        { id: 3, sender: "Alex Chen", recipient: "Alex Johnson", text: "I'm interested in the 2BR suite.", time: "Monday", unread: false }
      ],
      tenantMatches: [
        { id: 1, name: "David Kim", score: 96, property: "Skyview Residences", status: "Highly Compatible", avatar: "https://picsum.photos/seed/david/100/100" },
        { id: 2, name: "Emma Wilson", score: 92, property: "Uptown Lofts", status: "Great Match", avatar: "https://picsum.photos/seed/emma/100/100" },
        { id: 3, name: "Liam O'Brien", score: 89, property: "Skyview Residences", status: "Good Match", avatar: "https://picsum.photos/seed/liam/100/100" }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
};

initDb();
const getData = () => JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
const saveData = (data: any) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

async function startServer() {
  // connect to mongodb first
  await connectDB();

  // optionally seed users
  if (process.env.SEED_USERS !== "false") {
    try {
      await seedDummyUsers();
    } catch (err) {
      console.error("seedDummyUsers error:", err);
    }
  }

  const app = express();
  const PORT = 5001;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cors());

  // Mount auth routes (password -> OTP)
  app.use("/api/auth", authRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/messages", messagesRoutes);
  // Quick test-email endpoint (convenience) — you can call POST /api/auth/test-email
  // NOTE: the router already contains a test-email route if you used the new routes/auth.ts,
  // but keeping this here is safe if you prefer it in server.ts.
  app.post("/api/auth/test-email-local", async (req, res) => {
    try {
      const to = req.body?.to || process.env.SMTP_USER || "";
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.SMTP_USER || "no-reply@roomsync.local",
        to,
        subject: "RoomSync test email",
        text: "This is a test email from RoomSync — if you see this, SMTP is working."
      };

      if (!transporter) {
        console.error("No transporter configured — check SMTP_* env vars.");
        return res.status(500).json({ ok: false, message: "No SMTP configured (transporter null). Check .env" });
      }

      const info = await transporter.sendMail(mailOptions);
      console.log("Local test email sent:", info.messageId || info.response);
      return res.json({ ok: true, info });
    } catch (err) {
      console.error("test-email-local error:", err);
      return res.status(500).json({ ok: false, error: String(err) });
    }
  });

  // ─── LISTINGS ROUTES (MongoDB) ───────────────────────────────────────────

  // GET all listings
  app.get("/api/apartments", async (req, res) => {
    try {
      const listings = await Listing.find();
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  // GET single listing by ID
  app.get("/api/apartments/:id", async (req, res) => {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) return res.status(404).json({ error: "Apartment not found" });
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listing" });
    }
  });

  // POST create new listing
  app.post("/api/apartments", async (req, res) => {
    try {
      const body = { ...req.body };

      // Transform lat/lng from form into GeoJSON location for MongoDB
      if (body.lat !== undefined && body.lng !== undefined) {
        body.location = {
          type: "Point",
          coordinates: [parseFloat(body.lng), parseFloat(body.lat)] // [longitude, latitude]
        };
        delete body.lat;
        delete body.lng;
      }

      const listing = await Listing.create(body);
      res.json(listing);
    } catch (error) {
      console.error("Create listing error:", error);
      res.status(500).json({ error: "Failed to create listing" });
    }
  });

  // PUT update listing
  app.put("/api/apartments/:id", async (req, res) => {
    try {
      const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!listing) return res.status(404).json({ error: "Apartment not found" });
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to update listing" });
    }
  });

  // DELETE listing
  app.delete("/api/apartments/:id", async (req, res) => {
    try {
      const listing = await Listing.findByIdAndDelete(req.params.id);
      if (!listing) return res.status(404).json({ error: "Apartment not found" });
      res.json({ message: "Listing deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete listing" });
    }
  });

  // ─── OTHER ROUTES (db.json — to be migrated later) ──────────────────────

  app.get("/api/roommates", (req, res) => {
    const data = getData();
    res.json(data.roommates);
  });

  app.get("/api/leads", (req, res) => {
    const data = getData();
    res.json(data.leads);
  });

  app.get("/api/messages", (req, res) => {
    const data = getData();
    res.json(data.messages);
  });

  app.post("/api/messages", (req, res) => {
    const data = getData();
    const newMessage = {
      id: Date.now(),
      sender: req.body.sender || "Alex Johnson",
      recipient: req.body.recipient,
      text: req.body.text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      unread: false
    };
    data.messages.push(newMessage);
    saveData(data);
    res.json(newMessage);
  });

  app.get("/api/tenant-matches", (req, res) => {
    const data = getData();
    res.json(data.tenantMatches);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();