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
import Profile from "./models/Profile.js";
import { Message } from "./models/Message.js";

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

  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ limit: "100mb", extended: true }));
  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
  app.use(
    cors({
      origin: clientOrigin,
      credentials: true
    })
  );

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

  // POST increment view count for a listing
  app.post("/api/apartments/:id/views", async (req, res) => {
    try {
      const listing = await Listing.findByIdAndUpdate(
        req.params.id,
        { $inc: { views: 1 } },
        { new: true, runValidators: true }
      );

      if (!listing) return res.status(404).json({ error: "Apartment not found" });

      res.json(listing);
    } catch (error) {
      console.error("Failed to increment listing views:", error);
      res.status(500).json({ error: "Failed to increment listing views" });
    }
  });

  // POST create new listing
  app.post("/api/apartments", async (req, res) => {
    try {
      const body = { ...req.body };

      if (!body.ownerId) {
        return res.status(400).json({ error: "Owner ID required" });
      }

      const profile = await Profile.findOne({ userId: body.ownerId });
      if (!profile) {
        return res.status(404).json({ error: "User not found" });
      }

      if (body.lat !== undefined && body.lng !== undefined) {
        body.location = {
          type: "Point",
          coordinates: [parseFloat(body.lng), parseFloat(body.lat)],
        };
        delete body.lat;
        delete body.lng;
      }

      // keep ownerId consistent with what PostProperty.jsx sends
      body.ownerId = profile.userId;

      body.owner = {
        name: profile.fullname,
        avatar: profile.profilePic || "",
      };

      body.views = body.views ?? 0;
      body.matches = body.matches ?? 0;
      body.status = body.status || "Active";

      const listing = await Listing.create(body);
      return res.status(201).json(listing);
    } catch (error) {
      console.error("Create listing error:", error);
      return res.status(500).json({ error: "Failed to create listing" });
    }
  });

  // PUT update listing
  app.put("/api/apartments/:id", async (req, res) => {
    try {
      const { lat, lng, ...rest } = req.body;

      const update = { ...rest };

      if (lat !== undefined && lng !== undefined) {
        update.location = {
          type: "Point",
          coordinates: [Number(lng), Number(lat)], // [lng, lat]
        };
      }

      const listing = await Listing.findByIdAndUpdate(
        req.params.id,
        update,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!listing) {
        return res.status(404).json({ error: "Apartment not found" });
      }

      res.json(listing);
    } catch (error) {
      console.error("Failed to update listing:", error);
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

  // ─── ANALYTICS ROUTES ───────────────────────────────────────────────────

  // GET overview stats for a lister
  app.get("/api/analytics/overview/:ownerId", async (req, res) => {
    try {
      const { ownerId } = req.params;

      // Total Views: sum of views for all listings
      const listings = await Listing.find({ ownerId });
      const totalViews = listings.reduce((sum, listing) => sum + (listing.views || 0), 0);

      // Active Inquiries: count of unread messages where recipient is the owner
      const activeInquiries = await Message.countDocuments({ recipientId: ownerId, read: false });

      // Listing Strength: calculate based on listing completeness (simple score)
      const avgStrength = listings.length > 0 
        ? listings.reduce((sum, listing) => {
            let score = 0;
            if (listing.title) score += 20;
            if (listing.description) score += 20;
            if (listing.images && listing.images.length > 0) score += 20;
            if (listing.amenities && listing.amenities.length > 0) score += 20;
            if (listing.price) score += 20;
            return sum + score;
          }, 0) / listings.length
        : 0;

      const listingStrength = avgStrength >= 80 ? "Great" : avgStrength >= 60 ? "Good" : "Needs Improvement";

      res.json({
        totalViews,
        activeInquiries,
        listingStrength,
        changeViews: "+12%", // Mock change
        changeInquiries: "+5%", // Mock change
        changeStrength: "-2%" // Mock change
      });
    } catch (error) {
      console.error("Analytics overview error:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // GET detailed analytics for a lister
  app.get("/api/analytics/detailed/:ownerId", async (req, res) => {
    try {
      const { ownerId } = req.params;

      // Get all listings for this owner
      const listings = await Listing.find({ ownerId });

      // Calculate Views Over Time based on real listing data
      const now = new Date();
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          month: date.toLocaleString('default', { month: 'short' }),
          year: date.getFullYear(),
          date: date,
          views: 0
        });
      }

      // Distribute views based on listing creation dates
      listings.forEach(listing => {
        const createdAt = new Date(listing.createdAt || now);
        const views = listing.views || 0;
        
        if (views > 0) {
          // Calculate how many months the listing has been active
          const monthsActive = Math.max(1, Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)));
          
          // Distribute views across the active months, with more weight on recent months
          for (let i = 0; i < monthsActive && i < 12; i++) {
            const monthIndex = 11 - i; // Start from most recent
            if (monthIndex >= 0) {
              const weight = Math.max(0.1, 1 - (i * 0.1)); // Recent months get more weight
              months[monthIndex].views += Math.round((views / monthsActive) * weight);
            }
          }
        }
      });

      const viewsOverTime = months.map(m => ({ month: m.month, views: m.views }));

      // Lead Sources: Keep mock data for now (would need additional tracking)
      const leadSources = [
        { label: "Direct Search", value: 45 },
        { label: "Social Media", value: 30 },
        { label: "University Portals", value: 15 },
        { label: "Referrals", value: 10 }
      ];

      // Additional real stats
      const totalListings = listings.length;
      const activeListings = listings.filter(l => l.status === 'Active').length;
      const totalMatches = listings.reduce((sum, l) => sum + (l.matches || 0), 0);
      const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);

      res.json({
        viewsOverTime,
        leadSources,
        totalListings,
        activeListings,
        totalMatches,
        totalViews
      });
    } catch (error) {
      console.error("Analytics detailed error:", error);
      res.status(500).json({ error: "Failed to fetch detailed analytics" });
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