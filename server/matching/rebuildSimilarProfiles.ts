import Profile from "../models/Profile.js";
import SimilarProfile from "../models/SimilarProfile.js";
import User from "../models/User.js";
import { sameUserId } from "./ids.js";
import { mapProfileToMatchFeatures } from "./normalize.js";
import { scorePairWeightedV1 } from "./weightedV1.js";

const TOP_K = 10;

/**
 * Recomputes top-K similar users for every **student** roommate profile.
 * Property owners (`accountRole: "owner"`) are excluded from matching and
 * do not receive SimilarProfile documents.
 */
export async function rebuildAllSimilarProfiles(): Promise<void> {
  const roommateUserIds = await User.find({ accountRole: { $ne: "owner" } }).distinct("_id");
  const idSet = new Set(roommateUserIds.map((id) => String(id)));

  const profiles = await Profile.find().lean();
  const roommateProfiles = profiles.filter((p) => idSet.has(String(p.userId)));

  for (const p of roommateProfiles) {
    const featuresA = mapProfileToMatchFeatures(p);

    const similarProfiles = roommateProfiles
      .filter((o) => !sameUserId(o.userId, p.userId))
      .map((o) => {
        const { compatibilityScore } = scorePairWeightedV1(featuresA, mapProfileToMatchFeatures(o));
        return {
          userId: o.userId,
          username: o.username || "",
          compatibilityScore
        };
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, TOP_K);

    await SimilarProfile.findOneAndUpdate(
      { userId: p.userId },
      { $set: { similarProfiles } },
      { upsert: true }
    );
  }

  await SimilarProfile.deleteMany({
    userId: { $nin: roommateProfiles.map((p) => p.userId) }
  });
}
