import type { MatchFeatures, SleepSchedule } from "./types.js";

type RawProfile = {
  lifestyle?: {
    sleep?: string;
    social?: string;
    cleanliness?: number | string;
  };
  livingPreferences?: {
    budget?: number | string;
    neighborhoods?: readonly string[];
    moveIn?: string;
    entireUnit?: boolean;
  };
};

function normalizeSleep(raw?: string): SleepSchedule {
  if (!raw || typeof raw !== "string") return "unknown";
  const x = raw.toLowerCase().trim();
  if (x === "early" || x.includes("early")) return "early";
  if (x === "late" || x === "night" || x.includes("night") || x.includes("owl")) return "late";
  return "unknown";
}

/** Maps onboarding + seed variants onto 0–1; null if unknown. */
function normalizeSocialLevel(raw?: string): number | null {
  if (!raw || typeof raw !== "string") return null;
  const x = raw.toLowerCase().trim();
  if (x.includes("very social")) return 1;
  if (x === "social" || x === "moderate") return 0.65;
  if (x === "private" || x === "quiet") return 0.28;
  return null;
}

function normalizeCleanliness(raw?: number | string): number {
  const n = typeof raw === "string" ? parseFloat(raw) : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 2.5;
  return Math.min(5, Math.max(1, n));
}

function normalizeBudget(raw?: number | string): number | null {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function normalizeNeighborhoods(raw?: readonly string[]): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((n) => String(n).toLowerCase().trim()).filter(Boolean);
}

function normalizeMoveIn(raw?: string): string | null {
  if (!raw || typeof raw !== "string") return null;
  const t = Date.parse(raw);
  return Number.isFinite(t) ? raw : null;
}

/**
 * Single place: DB / API profile → features all matchers consume.
 */
export function mapProfileToMatchFeatures(profile: RawProfile): MatchFeatures {
  return {
    sleep: normalizeSleep(profile.lifestyle?.sleep),
    socialLevel: normalizeSocialLevel(profile.lifestyle?.social),
    cleanliness: normalizeCleanliness(profile.lifestyle?.cleanliness),
    budget: normalizeBudget(profile.livingPreferences?.budget),
    neighborhoods: normalizeNeighborhoods(profile.livingPreferences?.neighborhoods),
    moveIn: normalizeMoveIn(profile.livingPreferences?.moveIn),
    entireUnit:
      profile.livingPreferences?.entireUnit === undefined
        ? null
        : Boolean(profile.livingPreferences.entireUnit)
  };
}
