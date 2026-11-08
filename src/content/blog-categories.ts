/**
 * Blog feed rubrics — Confirmed from Tilda `feeds_get_parts`
 * (RU feed `921152316206`, EN `370831704951`, 01.11.2026).
 *
 * `categoryId` is locale-invariant; `categoryLabel` is the chip shown in UI.
 * Posts may belong to multiple Tilda parts; primary = first id in post `parts`.
 */

export const BLOG_CATEGORY_IDS = [
  "news",
  "releases",
  "library",
  "recipes",
  "interview",
  "events",
  "photo",
  "vacancies",
] as const;

export type BlogCategoryId = (typeof BLOG_CATEGORY_IDS)[number];

/** Tilda part UID → categoryId (RU feed). */
export const TILDA_RU_PART_TO_CATEGORY: Record<string, BlogCategoryId> = {
  "169997866064": "news",
  "210583703301": "releases",
  "871080391861": "library",
  "754555711311": "recipes",
  "446174878601": "interview",
  "358096315195": "events",
  "759457713299": "photo",
  "393348486851": "vacancies",
};

/** Tilda part UID → categoryId (EN feed). */
export const TILDA_EN_PART_TO_CATEGORY: Record<string, BlogCategoryId> = {
  "667449707201": "news",
  "672729617981": "releases",
  "881234404841": "library", // feed title: GLOSSARY
  "576617130771": "recipes",
  "142984612181": "interview",
  "286626629781": "events",
  "364930516111": "photo",
};

export const BLOG_CATEGORY_LABELS: Record<
  BlogCategoryId,
  { ru: string; en: string }
> = {
  news: { ru: "НОВОСТИ", en: "NEWS" },
  releases: { ru: "РЕЛИЗЫ", en: "RELEASES" },
  library: { ru: "БИБЛИОТЕКА", en: "GLOSSARY" },
  recipes: { ru: "ФУДПЕЙРИНГ / РЕЦЕПТЫ", en: "RECIPES" },
  interview: { ru: "ИНТЕРВЬЮ", en: "INTERVIEW" },
  events: { ru: "МЕРОПРИЯТИЯ", en: "EVENTS" },
  photo: { ru: "ФОТО / ВИДЕО", en: "PHOTO" },
  vacancies: { ru: "ВАКАНСИИ", en: "VACANCIES" },
};

/**
 * When only a set of parts is known (no order), prefer the more specific
 * editorial rubric. Prefer `parts` string order from `feeds_get_post` when available.
 */
const PRIMARY_PRIORITY: BlogCategoryId[] = [
  "recipes",
  "interview",
  "releases",
  "photo",
  "events",
  "library",
  "news",
  "vacancies",
];

export function categoryLabel(
  id: BlogCategoryId,
  locale: "ru" | "en",
): string {
  return BLOG_CATEGORY_LABELS[id][locale];
}

export function primaryCategoryFromPartIds(
  partIds: string[],
  locale: "ru" | "en",
): BlogCategoryId | undefined {
  const map =
    locale === "en" ? TILDA_EN_PART_TO_CATEGORY : TILDA_RU_PART_TO_CATEGORY;
  const cats = partIds
    .map((p) => map[p.trim()])
    .filter((c): c is BlogCategoryId => Boolean(c));
  if (!cats.length) return undefined;
  // Preserve Tilda `parts` order (first wins).
  return cats[0];
}

export function primaryCategoryFromSet(
  cats: Iterable<BlogCategoryId>,
): BlogCategoryId | undefined {
  const set = new Set(cats);
  for (const id of PRIMARY_PRIORITY) {
    if (set.has(id)) return id;
  }
  return undefined;
}
