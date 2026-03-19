import express from "express";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Otp from "../models/Otp.js";

const router = express.Router();

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
    await Otp.deleteMany({ userId });

    res.json({ message: "Account deleted successfully" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;