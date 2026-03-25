import mongoose from "mongoose";

const similarProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    similarProfiles: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        username: {
          type: String,
          required: true
        },
        compatibilityScore: {
          type: Number,
          default: 0,
          min: 0,
          max: 100
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("SimilarProfile", similarProfileSchema);
