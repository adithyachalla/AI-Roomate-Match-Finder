import mongoose from "mongoose";
import dotenv from "dotenv";
import Listing from "./models/Listing.js";

dotenv.config();

const seedListings = [
  {
    title: "Skyview Residences",
    description: "A modern 2-bedroom apartment near USC campus with top amenities.",
    price: 1850,
    bedrooms: 2,
    bathrooms: 2,
    distance: "0.3 mi to Campus",
    images: [
       "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
       "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80",
       "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80"
    ],
    roomType: "Private",
    leaseDuration: "Full Year",
    amenities: ["Gym", "Doorman", "Laundry"],
    is_ai_match: true,
    status: "Active",
    views: 1240,
    matches: 8,
    owner: { name: "Alex Johnson", avatar: "https://picsum.photos/seed/lister/100/100" },
    location: {
      type: "Point",
      coordinates: [-118.2879, 34.0259],
    },
    address: "University Park, LA",
  },
  {
    title: "Uptown Lofts",
    description: "Cozy 1-bedroom loft in West Adams, pet friendly with WiFi included.",
    price: 1400,
    bedrooms: 1,
    bathrooms: 1,
    distance: "0.9 mi to Campus",
    images: [
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"
    ],
    roomType: "Private",
    leaseDuration: "Semester",
    amenities: ["Pet Friendly", "WiFi"],
    is_ai_match: true,
    status: "Pending",
    views: 850,
    matches: 3,
    owner: { name: "Sarah Miller", avatar: "https://picsum.photos/seed/sarah/100/100" },
    location: {
      type: "Point",
      coordinates: [-118.2812, 34.0194],
    },
    address: "West Adams, LA",
  },
  {
    title: "The Bradhurst",
    description: "Spacious 3-bedroom unit in Exposition Park, furnished with parking.",
    price: 2100,
    bedrooms: 3,
    bathrooms: 2,
    distance: "1.2 mi to Campus",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80"
    ],
    roomType: "Shared",
    leaseDuration: "Full Year",
    amenities: ["Furnished", "Parking"],
    is_ai_match: false,
    status: "Active",
    views: 391,
    matches: 1,
    owner: { name: "David Kim", avatar: "https://picsum.photos/seed/david/100/100" },
    location: {
      type: "Point",
      coordinates: [-118.2925, 34.0215],
    },
    address: "Exposition Park, LA",
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB");

    await Listing.deleteMany({});
    console.log("Cleared existing listings");

    await Listing.insertMany(seedListings);
    console.log(`Seeded ${seedListings.length} listings successfully`);

    await mongoose.disconnect();
    console.log("Done");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seed();
