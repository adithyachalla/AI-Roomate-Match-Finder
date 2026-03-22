import express from "express";
import Profile from "../models/Profile.js";
import SimilarProfile from "../models/SimilarProfile.js";

const router = express.Router();


// ✅ GET TOP 10 SIMILAR PROFILES FOR A USER (SORTED BY COMPATIBILITY SCORE)
// 🔥 THIS MUST COME BEFORE /:userId ROUTE
router.get("/similar/top/:userId", async (req, res) => {
  try {
    const similarProfilesRecord = await SimilarProfile.findOne({
      userId: req.params.userId
    }).populate({
      path: "similarProfiles.userId",
      model: "Profile",
      select: "userId username fullname bio profilePic lifestyle livingPreferences"
    });

    if (!similarProfilesRecord || !similarProfilesRecord.similarProfiles) {
      return res.json([]);
    }

    // Sort by compatibility score in descending order and take top 10
    const topProfiles = similarProfilesRecord.similarProfiles
      .sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0))
      .slice(0, 10)
      .map((profile) => ({
        ...profile.userId,
        compatibilityScore: profile.compatibilityScore || 0
      }));

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

      return res.json(updated);
    }

    // 🔥 OTHERWISE CREATE
    const profile = await Profile.create({
      userId,
      ...profileData
    });

    res.json(profile);

  } catch (err) {
    console.error("CREATE/UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


// ✅ GET PROFILE (SAFE FOR DASHBOARD)
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


// ✅ UPDATE PROFILE (SAFE + CONTROLLED)
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

    res.json(updated);

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;