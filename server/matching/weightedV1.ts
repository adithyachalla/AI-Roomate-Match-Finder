import type { MatchFeatures, MatchPairResult } from "./types.js";

const W = {
  sleep: 0.15,
  social: 0.2,
  cleanliness: 0.2,
  budget: 0.15,
  neighborhoods: 0.15,
  entireUnit: 0.05,
  moveIn: 0.1
} as const;

const SUM_W = Object.values(W).reduce((a, b) => a + b, 0);

function sleepComponent(a: MatchFeatures, b: MatchFeatures): number {
  if (a.sleep === "unknown" || b.sleep === "unknown") return 0.5;
  if (a.sleep === b.sleep) return 1;
  return 0.28;
}

function socialComponent(a: MatchFeatures, b: MatchFeatures): number {
  if (a.socialLevel === null || b.socialLevel === null) return 0.5;
  return Math.max(0, 1 - Math.abs(a.socialLevel - b.socialLevel));
}

function cleanlinessComponent(a: MatchFeatures, b: MatchFeatures): number {
  const diff = Math.abs(a.cleanliness - b.cleanliness);
  return Math.max(0, 1 - diff / 4);
}

function budgetComponent(a: MatchFeatures, b: MatchFeatures): number {
  if (a.budget === null || b.budget === null) return 0.5;
  return Math.min(a.budget, b.budget) / Math.max(a.budget, b.budget);
}

function jaccard(a: string[], b: string[]): number {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size === 0 && sb.size === 0) return 0.5;
  if (sa.size === 0 || sb.size === 0) return 0.35;
  let inter = 0;
  for (const x of sa) if (sb.has(x)) inter++;
  const union = sa.size + sb.size - inter;
  return inter / union;
}

function entireUnitComponent(a: MatchFeatures, b: MatchFeatures): number {
  if (a.entireUnit === null || b.entireUnit === null) return 0.5;
  return a.entireUnit === b.entireUnit ? 1 : 0.45;
}

function moveInComponent(a: MatchFeatures, b: MatchFeatures): number {
  if (!a.moveIn || !b.moveIn) return 0.5;
  const da = Date.parse(a.moveIn);
  const db = Date.parse(b.moveIn);
  if (!Number.isFinite(da) || !Number.isFinite(db)) return 0.5;
  const diffDays = Math.abs(da - db) / 86400000;
  if (diffDays <= 14) return 1;
  if (diffDays <= 60) return 0.85;
  if (diffDays <= 120) return 0.65;
  return 0.4;
}

/**
 * Weighted rules (v1). Symmetric: score(a,b) === score(b,a).
 */
export function scorePairWeightedV1(a: MatchFeatures, b: MatchFeatures): MatchPairResult {
  const cSleep = sleepComponent(a, b);
  const cSocial = socialComponent(a, b);
  const cClean = cleanlinessComponent(a, b);
  const cBudget = budgetComponent(a, b);
  const cHood = jaccard(a.neighborhoods, b.neighborhoods);
  const cUnit = entireUnitComponent(a, b);
  const cMove = moveInComponent(a, b);

  const weighted =
    W.sleep * cSleep +
    W.social * cSocial +
    W.cleanliness * cClean +
    W.budget * cBudget +
    W.neighborhoods * cHood +
    W.entireUnit * cUnit +
    W.moveIn * cMove;

  const raw = weighted / SUM_W;
  const compatibilityScore = Math.round(Math.min(100, Math.max(0, raw * 100)));

  return {
    compatibilityScore,
    breakdown: {
      sleep: cSleep,
      social: cSocial,
      cleanliness: cClean,
      budget: cBudget,
      neighborhoods: cHood,
      entireUnit: cUnit,
      moveIn: cMove
    }
  };
}
