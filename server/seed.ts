import dotenv from "dotenv";
import mongoose from "mongoose";
import Listing from "./models/Listing.js";
import { Message } from "./models/Message.js";
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

    // Listing owners to create users for
    const listingOwnerUsers = [
      {
        username: "alex_johnson",
        email: "alex.johnson@example.com",
        fullname: "Alex Johnson",
        passwordHash: "hashed_password",
      },
      {
        username: "david_kim",
        email: "david.kim@example.com",
        fullname: "David Kim",
        passwordHash: "hashed_password",
      },
    ];

    // Find or create listing owner users
    const listingOwnerEmails = listingOwnerUsers.map(u => u.email);
    const existingListingOwners = await User.find({ email: { $in: listingOwnerEmails } });
    const existingEmails = new Set(existingListingOwners.map(u => u.email));
    
    const newListingOwners = listingOwnerUsers.filter(u => !existingEmails.has(u.email));
    let createdListingOwnerUsers = existingListingOwners;
    
    if (newListingOwners.length > 0) {
      const insertedUsers = await User.insertMany(newListingOwners);
      createdListingOwnerUsers = [...existingListingOwners, ...insertedUsers];
    }
    
    // Create profiles for listing owners if they don't exist
    const existingListingOwnerProfiles = await Profile.find({ userId: { $in: createdListingOwnerUsers.map(u => u._id) } });
    const existingProfileUserIds = new Set(existingListingOwnerProfiles.map(p => p.userId.toString()));
    
    const missingListingOwnerProfiles = createdListingOwnerUsers
      .filter(u => !existingProfileUserIds.has(u._id.toString()))
      .map((user, index) => ({
        userId: user._id,
        username: user.username,
        fullname: user.fullname,
        bio: index === 0 
          ? "Real estate enthusiast. Well-maintained properties at great locations."
          : "Property manager. Looking for reliable tenants.",
        profilePic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
        lifestyle: {
          sleep: "early",
          social: "moderate",
          cleanliness: 8
        },
        livingPreferences: {
          budget: 2000,
          neighborhoods: ["Downtown", "Midtown"],
          moveIn: "2024-08-01",
          entireUnit: true
        }
      }));

    if (missingListingOwnerProfiles.length > 0) {
      await Profile.insertMany(missingListingOwnerProfiles);
    }

    // Seed listings with ownerId references
    await Listing.deleteMany({});
    console.log("Cleared existing listings");

    const ownerMap = {};
    createdListingOwnerUsers.forEach(user => {
      if (user.fullname === "Alex Johnson") ownerMap["Alex Johnson"] = user._id;
      if (user.fullname === "Sarah Miller") ownerMap["Sarah Miller"] = user._id;
      if (user.fullname === "David Kim") ownerMap["David Kim"] = user._id;
    });

    // Add ownerId to listings
    const listingsWithOwners = seedListings.map(listing => ({
      ...listing,
      ownerId: ownerMap[listing.owner.name]
    }));

    await Listing.insertMany(listingsWithOwners);
    console.log(`Seeded ${listingsWithOwners.length} listings successfully`);

    // Seed sample profiles with similar profiles and compatibility scores
    const sampleProfiles = [
      {
        username: "sarah_miller",
        email: "sarah@example.com",
        fullname: "Sarah Miller",
        passwordHash: "hashed_password",
      },
      {
        username: "alex_chen",
        email: "alex@example.com",
        fullname: "Alex Chen",
        passwordHash: "hashed_password",
      },
      {
        username: "emma_wilson",
        email: "emma@example.com",
        fullname: "Emma Wilson",
        passwordHash: "hashed_password",
      },
      {
        username: "liam_obrien",
        email: "liam@example.com",
        fullname: "Liam O'Brien",
        passwordHash: "hashed_password",
      },
      {
        username: "mike_johnson",
        email: "mike@example.com",
        fullname: "Mike Johnson",
        passwordHash: "hashed_password",
      },
      {
        username: "olivia_brown",
        email: "olivia@example.com",
        fullname: "Olivia Brown",
        passwordHash: "hashed_password",
      },
      {
        username: "noah_davis",
        email: "noah@example.com",
        fullname: "Noah Davis",
        passwordHash: "hashed_password",
      },
      {
        username: "sophia_taylor",
        email: "sophia@example.com",
        fullname: "Sophia Taylor",
        passwordHash: "hashed_password",
      },
      {
        username: "ethan_martin",
        email: "ethan@example.com",
        fullname: "Ethan Martin",
        passwordHash: "hashed_password",
      },
      {
        username: "ava_anderson",
        email: "ava@example.com",
        fullname: "Ava Anderson",
        passwordHash: "hashed_password",
      },
      {
        username: "james_thomas",
        email: "james@example.com",
        fullname: "James Thomas",
        passwordHash: "hashed_password",
      },
      {
        username: "isabella_jackson",
        email: "isabella@example.com",
        fullname: "Isabella Jackson",
        passwordHash: "hashed_password",
      },
    ];

    // Clear existing test users and ALL related data
    const testEmails = sampleProfiles.map(p => p.email);
    const oldTestUsers = await User.find({ email: { $in: testEmails } });
    const oldTestUserIds = oldTestUsers.map(u => u._id);

    // Delete old test users
    await User.deleteMany({ email: { $in: testEmails } });
    
    // Delete profiles for old test users
    await Profile.deleteMany({ username: { $in: sampleProfiles.map(p => p.username) } });
    
    // Delete messages between old test users
    await Message.deleteMany({
      $or: [
        { senderId: { $in: oldTestUserIds } },
        { recipientId: { $in: oldTestUserIds } }
      ]
    });
    
    // Delete similar profiles for old test users
    await SimilarProfile.deleteMany({ userId: { $in: oldTestUserIds } });

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

    // Create similar profiles for ALL users (seeded + custom users)
    const allUsers = await User.find();
    
    if (allUsers.length > 1) {
      const similarProfilesDataArray = allUsers.map((user) => {
        // Get all other users (exclude current user)
        const otherUsers = allUsers.filter(otherUser => otherUser._id.toString() !== user._id.toString());
        
        // Filter out any users without username
        const validOtherUsers = otherUsers.filter(u => u.username && u.username.trim() !== '');
        
        return {
          userId: user._id,
          similarProfiles: validOtherUsers.slice(0, 10).map((otherUser) => ({
            userId: otherUser._id,
            username: otherUser.username,
            compatibilityScore: 85 + Math.floor(Math.random() * 15) // Random 85-100
          }))
        };
      });

      // Delete old similar profiles and create new ones
      await SimilarProfile.deleteMany({});
      await SimilarProfile.insertMany(similarProfilesDataArray);
      console.log("Seeded similar profiles for ALL users (seeded + custom) with compatibility scores");
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
