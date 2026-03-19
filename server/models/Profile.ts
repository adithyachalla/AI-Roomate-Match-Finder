import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    username: {
      type: String,
      required: true,
      unique: true
    },

    fullname: {
      type: String,
      required: true
    },

    bio: {
      type: String,
      default: ""
    },

    profilePic: {
      type: String,
      default: ""
    },

    lifestyle: {
      sleep: { type: String, default: "" },
      social: { type: String, default: "" },
      cleanliness: { type: Number, default: 0 }
    },

    livingPreferences: {
      budget: { type: Number, default: 0 },
      neighborhoods: { type: [String], default: [] },
      moveIn: { type: String, default: "" },
      entireUnit: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);