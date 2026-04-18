import express from "express";
import Profile from "../models/Profile.js";
import SimilarProfile from "../models/SimilarProfile.js";
import { sameUserId } from "../matching/ids.js";
import { rebuildAllSimilarProfiles } from "../matching/rebuildSimilarProfiles.js";

const router = express.Router();


// ✅ GET TOP 10 SIMILAR PROFILES FOR A USER (SORTED BY COMPATIBILITY SCORE)
// 🔥 THIS MUST COME BEFORE /:userId ROUTE
router.get("/similar/top/:userId", async (req, res) => {
  try {
    const similarProfilesRecord = await SimilarProfile.findOne({
      userId: req.params.userId
    });

    if (!similarProfilesRecord || !similarProfilesRecord.similarProfiles || similarProfilesRecord.similarProfiles.length === 0) {
      return res.json([]);
    }

    // Get the userIds from similar profiles
    const userIds = similarProfilesRecord.similarProfiles.map(p => p.userId);

    // Fetch full profile documents for these userIds
    const profiles = await Profile.find({ userId: { $in: userIds } });

    // Combine profiles with compatibility scores
    const viewerId = req.params.userId;

    const topProfiles = similarProfilesRecord.similarProfiles
      .map(similarItem => {
        if (sameUserId(similarItem.userId, viewerId)) {
          return null;
        }
        const profileDoc = profiles.find(p => p.userId.toString() === similarItem.userId.toString());
        return profileDoc ? {
          ...profileDoc.toObject(),
          compatibilityScore: similarItem.compatibilityScore || 0
        } : null;
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0))
      .slice(0, 10);

    res.json(topProfiles);

  } catch (err) {
    console.error("GET TOP SIMILAR PROFILES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET ALL PROFILES
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().select("-__v");
    res.json(profiles);
  } catch (err) {
    console.error("GET ALL PROFILES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { userId, profileData } = req.body;

    const existing = await Profile.findOne({ userId });

    // 🔥 IF PROFILE EXISTS → UPDATE
    if (existing) {
      const updated = await Profile.findOneAndUpdate(
        { userId },
        profileData,
        { new: true }
      );

      try {
        await rebuildAllSimilarProfiles();
      } catch (e) {
        console.error("rebuildAllSimilarProfiles after profile update:", e);
      }

      return res.json(updated);
    }

    // 🔥 OTHERWISE CREATE
    const profile = await Profile.create({
      userId,
      ...profileData
    });

    try {
      await rebuildAllSimilarProfiles();
    } catch (e) {
      console.error("rebuildAllSimilarProfiles after profile create:", e);
    }

    res.json(profile);

  } catch (err) {
    console.error("CREATE/UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ SAVE A PROFILE (ADD TO FAVORITES)
// 🔥 THIS MUST COME BEFORE /:userId ROUTE
router.post("/save/:userId/:profileIdToSave", async (req, res) => {
  try {
    const { userId, profileIdToSave } = req.params;

    // Find the user's profile
    const userProfile = await Profile.findOne({ userId });
    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    // Check if already saved
    if (userProfile.savedProfiles.includes(profileIdToSave)) {
      return res.status(400).json({ message: "Profile already saved" });
    }

    // Add to savedProfiles
    userProfile.savedProfiles.push(profileIdToSave);
    await userProfile.save();

    res.json({ message: "Profile saved successfully", savedProfiles: userProfile.savedProfiles });
  } catch (err) {
    console.error("SAVE PROFILE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ UNSAVE A PROFILE (REMOVE FROM FAVORITES)
// 🔥 THIS MUST COME BEFORE /:userId ROUTE
router.delete("/unsave/:userId/:profileIdToUnsave", async (req, res) => {
  try {
    const { userId, profileIdToUnsave } = req.params;

    // Find the user's profile
    const userProfile = await Profile.findOne({ userId });
    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    // Remove from savedProfiles
    userProfile.savedProfiles = userProfile.savedProfiles.filter(
      id => id.toString() !== profileIdToUnsave
    );
    await userProfile.save();

    res.json({ message: "Profile unsaved successfully", savedProfiles: userProfile.savedProfiles });
  } catch (err) {
    console.error("UNSAVE PROFILE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET ALL SAVED PROFILES FOR A USER
// 🔥 THIS MUST COME BEFORE /:userId ROUTE
router.get("/saved/:userId", async (req, res) => {
  try {
    const userProfile = await Profile.findOne({ userId: req.params.userId });
    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    // Get all saved profiles with full details
    const savedProfiles = await Profile.find({ _id: { $in: userProfile.savedProfiles } });

    res.json(savedProfiles);
  } catch (err) {
    console.error("GET SAVED PROFILES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ UPDATE PROFILE (SAFE + CONTROLLED)
// 🔥 THIS MUST COME BEFORE /:userId ROUTE
router.put("/update/:userId", async (req, res) => {
  try {
    const {
      bio,
      profilePic,
      lifestyle,
      livingPreferences,
      fullname
    } = req.body;

    const updated = await Profile.findOneAndUpdate(
      { userId: req.params.userId },
      {
        ...(bio !== undefined && { bio }),
        ...(profilePic !== undefined && { profilePic }),
        ...(lifestyle !== undefined && { lifestyle }),
        ...(livingPreferences !== undefined && { livingPreferences }),
        ...(fullname !== undefined && { fullname })
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Profile not found" });
    }

    try {
      await rebuildAllSimilarProfiles();
    } catch (e) {
      console.error("rebuildAllSimilarProfiles after profile put:", e);
    }

    res.json(updated);

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET PROFILE (GENERIC - MUST COME LAST)
router.get("/:userId", async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });

    // return empty object instead of error
    if (!profile) {
      return res.json({});
    }

    res.json(profile);

  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;