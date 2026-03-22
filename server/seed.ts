import dotenv from "dotenv";
import mongoose from "mongoose";
import Listing from "./models/Listing.js";
import Profile from "./models/Profile.js";
import SimilarProfile from "./models/SimilarProfile.js";
import User from "./models/User.js";

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

    // Seed listings
    await Listing.deleteMany({});
    console.log("Cleared existing listings");

    await Listing.insertMany(seedListings);
    console.log(`Seeded ${seedListings.length} listings successfully`);

    // Seed sample profiles with similar profiles and compatibility scores
    const sampleProfiles = [
      {
        username: "sarah_miller",
        email: "sarah@example.com",
        password: "hashed_password",
        role: "student",
      },
      {
        username: "alex_chen",
        email: "alex@example.com",
        password: "hashed_password",
        role: "student",
      },
      {
        username: "emma_wilson",
        email: "emma@example.com",
        password: "hashed_password",
        role: "student",
      },
      {
        username: "liam_obrien",
        email: "liam@example.com",
        password: "hashed_password",
        role: "student",
      },
      {
        username: "mike_johnson",
        email: "mike@example.com",
        password: "hashed_password",
        role: "student",
      },
      {
        username: "olivia_brown",
        email: "olivia@example.com",
        password: "hashed_password",
        role: "student",
      },
      {
        username: "noah_davis",
        email: "noah@example.com",
        password: "hashed_password",
        role: "student",
      },
      {
        username: "sophia_taylor",
        email: "sophia@example.com",
        password: "hashed_password",
        role: "student",
      },
      {
        username: "ethan_martin",
        email: "ethan@example.com",
        password: "hashed_password",
        role: "student",
      },
      {
        username: "ava_anderson",
        email: "ava@example.com",
        password: "hashed_password",
        role: "student",
      },
      {
        username: "james_thomas",
        email: "james@example.com",
        password: "hashed_password",
        role: "student",
      },
      {
        username: "isabella_jackson",
        email: "isabella@example.com",
        password: "hashed_password",
        role: "student",
      },
    ];

    // Clear existing users and profiles
    await User.deleteMany({ email: { $in: sampleProfiles.map(p => p.email) } });
    await Profile.deleteMany({ username: { $in: sampleProfiles.map(p => p.username) } });
    await SimilarProfile.deleteMany({});

    // Create sample users
    const createdUsers = await User.insertMany(sampleProfiles);
    console.log(`Seeded ${createdUsers.length} users successfully`);

    // Create corresponding profiles
    const profileData = createdUsers.map((user, index) => ({
      userId: user._id,
      username: user.username,
      fullname: ["Sarah Miller", "Alex Chen", "Emma Wilson", "Liam O'Brien", "Mike Johnson", "Olivia Brown", "Noah Davis", "Sophia Taylor", "Ethan Martin", "Ava Anderson", "James Thomas", "Isabella Jackson"][index],
      bio: [
        "Graduate student at USC. Quiet, focus-oriented, and loves coffee.",
        "Engineering major. Loves gaming and cooking. Looking for someone social.",
        "Business student. Early riser, loves the gym.",
        "Computer Science major. Night owl, loves music.",
        "Pre-med student. Clean and organized.",
        "Art student. Social butterfly, loves hosting.",
        "Law student. Quiet, dedicated to studies.",
        "Marketing student. Love collaborating on projects.",
        "Math major. Introverted, very clean.",
        "Chemistry student. Extroverted, loves parties.",
        "Physics student. Calm and thoughtful.",
        "Biology student. Active and outdoorsy."
      ][index],
      profilePic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
      lifestyle: {
        sleep: ["early", "late", "early", "late", "early", "late", "early", "late", "early", "late", "early", "late"][index],
        social: ["quiet", "social", "moderate", "social", "quiet", "very social", "quiet", "moderate", "quiet", "very social", "quiet", "moderate"][index],
        cleanliness: [9 - (index % 3), 6 + (index % 4), 8, 5, 9, 7, 8, 6, 9, 7, 8, 6][index]
      },
      livingPreferences: {
        budget: 1000 + index * 100,
        neighborhoods: ["Downtown", "Midtown", "Uptown"],
        moveIn: "2024-08-01",
        entireUnit: index % 2 === 0
      }
    }));

    const createdProfiles = await Profile.insertMany(profileData);
    console.log(`Seeded ${createdProfiles.length} profiles successfully`);

    // Create similar profiles for first user (so we can see matches)
    if (createdUsers.length > 1) {
      const firstUserId = createdUsers[0]._id;
      const similarProfilesData = {
        userId: firstUserId,
        similarProfiles: createdUsers.slice(1, 11).map((user, index) => ({
          userId: user._id,
          username: user.username,
          compatibilityScore: 95 - index * 5 // Descending compatibility scores from 95 to 50
        }))
      };

      await SimilarProfile.create(similarProfilesData);
      console.log("Seeded similar profiles with compatibility scores");
    }

    await mongoose.disconnect();
    console.log("Done");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seed();
