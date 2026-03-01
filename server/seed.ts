import mongoose from "mongoose";
import dotenv from "dotenv";
import Listing from "./models/Listing.js";

dotenv.config();

const seedListings = [
  {
    title: "Skyview Residences",
    description: "A modern 2-bedroom apartment near USC campus with top amenities.",
    price: 1850,
    images: [
      "https://picsum.photos/seed/apt1-1/800/600",
      "https://picsum.photos/seed/apt1-2/800/600",
      "https://picsum.photos/seed/apt1-3/800/600",
    ],
    roomType: "Private",
    leaseDuration: "Full Year",
    amenities: ["Gym", "Doorman", "Laundry"],
    location: {
      type: "Point",
      coordinates: [-118.2879, 34.0259], // [Longitude, Latitude]
    },
    address: "University Park, LA",
  },
  {
    title: "Uptown Lofts",
    description: "Cozy 1-bedroom loft in West Adams, pet friendly with WiFi included.",
    price: 1400,
    images: [
      "https://picsum.photos/seed/apt2-1/800/600",
      "https://picsum.photos/seed/apt2-2/800/600",
    ],
    roomType: "Private",
    leaseDuration: "Semester",
    amenities: ["Pet Friendly", "WiFi"],
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
    images: [
      "https://picsum.photos/seed/apt3-1/800/600",
      "https://picsum.photos/seed/apt3-2/800/600",
      "https://picsum.photos/seed/apt3-3/800/600",
    ],
    roomType: "Shared",
    leaseDuration: "Full Year",
    amenities: ["Furnished", "Parking"],
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
