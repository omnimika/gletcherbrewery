/**
 * Status / level / prize from Airtable Пользователи formulas (Confirmed 11.11 MCP).
 * Source fields: Статус fldKqBz1vN4F4tXSL, Уровень fldwiKIUkcSh8nEgD,
 * Приз flduTkNawallqoxZ8, До следующего уровня fldSCBKGx5nlifmmj,
 * Процент fldXKiZ2TVoWwi3zc — all keyed off Биркоины всего накоплено.
 */

export const LK_LEVEL_STEP_BIRCOINS = 1000 as const;

/** Legend progress denominator from formula `(lifetime * 100) / 12000`. */
export const LK_LEGEND_TARGET_BIRCOINS = 12_000 as const;

type StatusBand = {
  /** Inclusive upper bound of lifetime earn for this status. */
  maxEarn: number;
  /** Display name without Airtable emoji chrome. */
  status: string;
  prize: string;
};

/**
 * Nested IF ladder from Airtable (emoji stripped for DS UI).
 * Last band covers `> 10999` → Легенда.
 */
const STATUS_BANDS: readonly StatusBand[] = [
  { maxEarn: 999, status: "Новичок", prize: "—" },
  { maxEarn: 1999, status: "Первооткрыватель", prize: "Ящик регулярного сорта" },
  {
    maxEarn: 2999,
    status: "Любитель",
    prize: "2 ящика сезонного + бокал на выбор",
  },
  {
    maxEarn: 3999,
    status: "Завсегдатай",
    prize: "Экскурсия на 4-х человек + бочка пива",
  },
  {
    maxEarn: 4999,
    status: "Коллекционер",
    prize: "Все бокалы, кепка, майка, костеры и 2 барных таблички",
  },
  {
    maxEarn: 5999,
    status: "Энтузиаст",
    prize: "Варка пива + ящик любимого пива",
  },
  {
    maxEarn: 6999,
    status: "Сомелье",
    prize: "Набор дегустационных бокалов + гастротур на 4 персоны",
  },
  {
    maxEarn: 7999,
    status: "Биргик",
    prize:
      "Экскурсия на 8-х человек + 2 бочки пива + барная табличка на выбор",
  },
  {
    maxEarn: 8999,
    status: "Суперзвезда",
    prize: "Сертификат на 10000₽ в фирменный магазин Svam Group",
  },
  { maxEarn: 9999, status: "Магнат", prize: "12 ящиков пива на выбор" },
  {
    maxEarn: 10999,
    status: "Авторитет",
    prize:
      "Участие в разработке названия и рецептуры пива + варка на заводе + ящик + подпись авторства на этикетке",
  },
  {
    maxEarn: Number.POSITIVE_INFINITY,
    status: "Легенда",
    prize: "Годовой запас пива (24 ящика) + пивная вечеринка (12 человек)",
  },
];

export type LoyaltyProgress = {
  /** Airtable Уровень ≈ floor(lifetime / 1000). */
  level: number;
  intoLevel: number;
  /** Airtable: `1000 - MOD(lifetime, 1000)` (0 → 1000). */
  toNextLevel: number;
  /** Progress within current 1000₿ step (0–100). */
  progressPct: number;
  status: string;
  prize: string;
  /** Airtable `Процент` = lifetime*100/12000, capped 0–100 for UI. */
  legendProgressPct: number;
};

function bandForLifetime(lifetimeEarn: number): StatusBand {
  const earn = Math.max(0, Math.floor(lifetimeEarn));
  for (const band of STATUS_BANDS) {
    if (earn <= band.maxEarn) return band;
  }
  return STATUS_BANDS[STATUS_BANDS.length - 1]!;
}

export function loyaltyProgressFromLifetime(
  lifetimeEarn: number,
): LoyaltyProgress {
  const earn = Math.max(0, Math.floor(lifetimeEarn));
  const step = LK_LEVEL_STEP_BIRCOINS;
  const level = Math.floor(earn / step);
  const intoLevel = earn % step;
  // Airtable: 1000 - MOD(x,1000); when MOD=0 → 1000.
  const toNextLevel = intoLevel === 0 ? step : step - intoLevel;
  const progressPct =
    intoLevel === 0 ? 0 : Math.min(100, Math.round((intoLevel / step) * 100));
  const band = bandForLifetime(earn);
  const legendProgressPct = Math.min(
    100,
    Math.max(0, Math.round((earn * 100) / LK_LEGEND_TARGET_BIRCOINS)),
  );

  return {
    level,
    intoLevel,
    toNextLevel,
    progressPct,
    status: band.status,
    prize: band.prize,
    legendProgressPct,
  };
}

/** @deprecated Prefer loyaltyProgressFromLifetime */
export function provisionalLevelFromLifetime(lifetimeEarn: number) {
  const p = loyaltyProgressFromLifetime(lifetimeEarn);
  return {
    level: p.level,
    intoLevel: p.intoLevel,
    toNextLevel: p.toNextLevel,
    progressPct: p.progressPct,
  };
}
