import express from "express";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Otp from "../models/Otp.js";
import SimilarProfile from "../models/SimilarProfile.js";
import { rebuildAllSimilarProfiles } from "../matching/rebuildSimilarProfiles.js";

const router = express.Router();

const ACCOUNT_ROLES = new Set(["student", "owner"]);

/**
 * PATCH /api/user/:userId/account-role
 * Body: { accountRole: "student" | "owner" }
 * Persists signup / role-switch choice so APIs can separate listers from roommate seekers.
 */
router.patch("/:userId/account-role", async (req, res) => {
  try {
    const { userId } = req.params;
    const { accountRole } = req.body;

    if (!userId || !ACCOUNT_ROLES.has(String(accountRole))) {
      return res.status(400).json({ message: "userId and valid accountRole (student|owner) required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { accountRole },
      { new: true }
    ).select("_id username fullname email accountRole");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    try {
      await rebuildAllSimilarProfiles();
    } catch (e) {
      console.error("rebuildAllSimilarProfiles after account-role update:", e);
    }

    return res.json({
      user: {
        _id: user._id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        accountRole: user.accountRole || "student"
      }
    });
  } catch (err) {
    console.error("PATCH account-role error:", err);
    return res.status(500).json({ message: err instanceof Error ? err.message : "Server error" });
  }
});

// ✅ DELETE ACCOUNT
router.delete("/delete/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    // delete everything
    await User.deleteOne({ _id: userId });
    await Profile.deleteOne({ userId });
    await SimilarProfile.deleteMany({ userId });
    await Otp.deleteMany({ userId });

    res.json({ message: "Account deleted successfully" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;