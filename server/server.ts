import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, "db.json");

// Simple NoSQL-like JSON storage
const initDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      apartments: [
        {
          id: 1,
          title: "Skyview Residences",
          address: "University Park, LA",
          price: 1850,
          bedrooms: 2,
          bathrooms: 2,
          distance: "0.3 mi to Campus",
          image_url: "https://picsum.photos/seed/apt1/800/600",
          images: [
            "https://picsum.photos/seed/apt1-1/800/600",
            "https://picsum.photos/seed/apt1-2/800/600",
            "https://picsum.photos/seed/apt1-3/800/600"
          ],
          amenities: ["Gym", "Doorman", "Laundry"],
          is_ai_match: true,
          status: "Active",
          views: 1240,
          matches: 8,
          lat: 34.0259,
          lng: -118.2879,
          owner: {
            name: "Alex Johnson",
            avatar: "https://picsum.photos/seed/lister/100/100"
          }
        },
        {
          id: 2,
          title: "Uptown Lofts",
          address: "West Adams, LA",
          price: 1400,
          bedrooms: 1,
          bathrooms: 1,
          distance: "0.9 mi to Campus",
          image_url: "https://picsum.photos/seed/apt2/800/600",
          images: [
            "https://picsum.photos/seed/apt2-1/800/600",
            "https://picsum.photos/seed/apt2-2/800/600"
          ],
          amenities: ["Pet Friendly", "WiFi"],
          is_ai_match: true,
          status: "Pending",
          views: 850,
          matches: 3,
          lat: 34.0194,
          lng: -118.2812,
          owner: {
            name: "Sarah Miller",
            avatar: "https://picsum.photos/seed/sarah/100/100"
          }
        },
        {
          id: 3,
          title: "The Bradhurst",
          address: "Exposition Park, LA",
          price: 2100,
          bedrooms: 3,
          bathrooms: 2,
          distance: "1.2 mi to Campus",
          image_url: "https://picsum.photos/seed/apt3/800/600",
          images: [
            "https://picsum.photos/seed/apt3-1/800/600",
            "https://picsum.photos/seed/apt3-2/800/600",
            "https://picsum.photos/seed/apt3-3/800/600"
          ],
          amenities: ["Furnished", "Parking"],
          is_ai_match: false,
          status: "Active",
          views: 391,
          matches: 1,
          lat: 34.0215,
          lng: -118.2925,
          owner: {
            name: "David Kim",
            avatar: "https://picsum.photos/seed/david/100/100"
          }
        }
      ],
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
  const app = express();
  const PORT = 5000;

  app.use(express.json());
  app.use(cors());

  // API Routes
  app.get("/api/apartments", (req, res) => {
    const data = getData();
    res.json(data.apartments);
  });

  app.get("/api/apartments/:id", (req, res) => {
    const data = getData();
    const id = parseInt(req.params.id);
    const apartment = data.apartments.find(apt => apt.id === id);
    if (apartment) {
      res.json(apartment);
    } else {
      res.status(404).json({ error: "Apartment not found" });
    }
  });

  app.put("/api/apartments/:id", (req, res) => {
    const data = getData();
    const id = parseInt(req.params.id);
    const index = data.apartments.findIndex(apt => apt.id === id);
    if (index !== -1) {
      data.apartments[index] = { ...data.apartments[index], ...req.body };
      saveData(data);
      res.json(data.apartments[index]);
    } else {
      res.status(404).json({ error: "Apartment not found" });
    }
  });

  app.post("/api/apartments", (req, res) => {
    const data = getData();
    const newApartment = {
      id: Date.now(),
      ...req.body,
      status: "Active",
      views: 0,
      matches: 0,
      is_ai_match: false
    };
    data.apartments.push(newApartment);
    saveData(data);
    res.json(newApartment);
  });

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
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
