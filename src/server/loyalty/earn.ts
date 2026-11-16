/** Owner Confirmed: 5% of Gletcher line sum → биркоины. */
export const CHECK_REWARD_RATE = 0.05;

/**
 * `round(sum_gletcher * 0.05)` — same family as Make `{{round(1.amount * 0.05)}}`.
 * Uses half-up away from zero on 0.5 (JS Math.round).
 */
export function checkEarnBircoins(gletcherSumRub: number): number {
  if (!Number.isFinite(gletcherSumRub) || gletcherSumRub < 0) {
    throw new RangeError("gletcherSumRub must be a finite non-negative number");
  }
  return Math.round(gletcherSumRub * CHECK_REWARD_RATE);
}
