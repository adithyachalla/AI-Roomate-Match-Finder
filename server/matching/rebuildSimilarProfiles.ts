import Profile from "../models/Profile.js";
import SimilarProfile from "../models/SimilarProfile.js";
import { sameUserId } from "./ids.js";
import { mapProfileToMatchFeatures } from "./normalize.js";
import { scorePairWeightedV1 } from "./weightedV1.js";

const TOP_K = 10;

/**
 * Recomputes top-K similar users for every profile using weighted-v1 scoring.
 * The viewer is never included in their own similarProfiles list.
 *
 * **New user (signup then onboarding):**
 * 1. Signup creates a stub Profile (empty lifestyle / zero budget). `rebuildAllSimilarProfiles`
 *    runs: the new user gets top-K others scored with mostly neutral/missing features; existing
 *    users get recomputed lists that may include the new user.
 * 2. Onboarding `POST /api/profile/create` saves real preferences and triggers another rebuild,
 *    so scores reflect the completed profile.
 */
export async function rebuildAllSimilarProfiles(): Promise<void> {
  const profiles = await Profile.find().lean();

  for (const p of profiles) {
    const featuresA = mapProfileToMatchFeatures(p);

    const similarProfiles = profiles
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
}
