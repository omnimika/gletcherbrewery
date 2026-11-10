import { LK_LEVEL_STEP_BIRCOINS } from "@/content/members-lk";

/**
 * Provisional level from Tilda copy (1000₿ / level).
 * Status names and prize table — Open until Airtable formulas confirmed.
 */
export function provisionalLevelFromLifetime(lifetimeEarn: number): {
  level: number;
  intoLevel: number;
  toNextLevel: number;
  progressPct: number;
} {
  const earn = Math.max(0, Math.floor(lifetimeEarn));
  const step = LK_LEVEL_STEP_BIRCOINS;
  const level = Math.floor(earn / step);
  const intoLevel = earn % step;
  const toNextLevel = step - intoLevel;
  const progressPct = Math.min(100, Math.round((intoLevel / step) * 100));
  return { level, intoLevel, toNextLevel, progressPct };
}
