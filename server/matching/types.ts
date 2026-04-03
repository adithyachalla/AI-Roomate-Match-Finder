/** Stable internal representation for any matcher implementation (v1 = weighted rules). */
export type SleepSchedule = "early" | "late" | "unknown";

export interface MatchFeatures {
  sleep: SleepSchedule;
  /** 0 = very private/quiet, 1 = very social; null = unknown → neutral scoring */
  socialLevel: number | null;
  /** 1–5 scale after normalization */
  cleanliness: number;
  /** null if missing or <= 0 */
  budget: number | null;
  neighborhoods: string[];
  /** ISO date string or null */
  moveIn: string | null;
  entireUnit: boolean | null;
}

/** Stable pair output: same shape for rules, ML, or hybrid later. */
export interface MatchPairResult {
  compatibilityScore: number;
  /** Optional 0–1-ish feature contributions for debugging / future UI */
  breakdown?: Record<string, number>;
}

export const MATCH_ALGORITHM_WEIGHTED_V1 = "weighted-v1" as const;
