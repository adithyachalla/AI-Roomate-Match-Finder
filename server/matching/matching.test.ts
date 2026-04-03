/**
 * Run: cd server && npm run test:match
 * No database required.
 */
import { sameUserId } from "./ids.js";
import { mapProfileToMatchFeatures } from "./normalize.js";
import { scorePairWeightedV1 } from "./weightedV1.js";

function assert(cond: unknown, message: string): void {
  if (!cond) {
    console.error("FAIL:", message);
    process.exit(1);
  }
}

assert(sameUserId("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439011"), "same id string");
assert(!sameUserId("a", "b"), "different ids");
assert(sameUserId("507f191e810c19729de860ea", "507f191e810c19729de860ea"), "hex ids match");

const rich = (overrides: Record<string, unknown> = {}) =>
  ({
    lifestyle: {
      sleep: "early",
      social: "quiet",
      cleanliness: 5,
      ...((overrides.lifestyle as object) || {})
    },
    livingPreferences: {
      budget: 1200,
      neighborhoods: ["downtown", "midtown"],
      moveIn: "2024-08-01",
      entireUnit: true,
      ...((overrides.livingPreferences as object) || {})
    }
  }) as const;

// Normalization
const n1 = mapProfileToMatchFeatures({ lifestyle: { sleep: "night", social: "private" } });
assert(n1.sleep === "late", 'sleep "night" should map to late');
assert(n1.socialLevel !== null && n1.socialLevel < 0.5, "private should be low social");

const n2 = mapProfileToMatchFeatures({ lifestyle: { sleep: "early" } });
assert(n2.sleep === "early", 'sleep "early" stays early');

// Identical profiles → high score
const base = rich();
const identical = scorePairWeightedV1(
  mapProfileToMatchFeatures(base),
  mapProfileToMatchFeatures(base)
);
assert(identical.compatibilityScore >= 92, `identical profiles should score high, got ${identical.compatibilityScore}`);

// Opposite sleep → lower than identical clone with same everything else
const lateOwl = rich({ lifestyle: { sleep: "late", social: "quiet", cleanliness: 5 } });
const earlyBird = rich({ lifestyle: { sleep: "early", social: "quiet", cleanliness: 5 } });
const mixedSleep = scorePairWeightedV1(
  mapProfileToMatchFeatures(earlyBird),
  mapProfileToMatchFeatures(lateOwl)
);
assert(
  mixedSleep.compatibilityScore < identical.compatibilityScore,
  `opposite sleep should score below identical (${mixedSleep.compatibilityScore} < ${identical.compatibilityScore})`
);

// Symmetry
const s1 = scorePairWeightedV1(mapProfileToMatchFeatures(rich()), mapProfileToMatchFeatures(lateOwl));
const s2 = scorePairWeightedV1(mapProfileToMatchFeatures(lateOwl), mapProfileToMatchFeatures(rich()));
assert(s1.compatibilityScore === s2.compatibilityScore, "score should be symmetric");

// Score in range
assert(s1.compatibilityScore >= 0 && s1.compatibilityScore <= 100, "score must be 0–100");

// Breakdown present
assert(s1.breakdown && typeof s1.breakdown.sleep === "number", "breakdown should include components");

console.log("OK: matching tests passed (normalize + weighted-v1).");
