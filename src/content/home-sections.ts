/**
 * Stable section manifest for home stretch slides.
 * Mid-blocks: SectionFrame mode=screen + CompositionGrid; snap ready.
 */

export type HomeSectionId =
  | "hero"
  | "moa"
  | "promos"
  | "tours"
  | "menu"
  | "blog"
  | "newsletter";

export type HomeSectionMode = "hero" | "screen";

export type HomeSectionDef = {
  id: HomeSectionId;
  labelRu: string;
  labelEn: string;
  mode: HomeSectionMode;
  /** Soft proximity snap for screen slides. */
  snapReady: boolean;
};

export const HOME_SECTIONS: readonly HomeSectionDef[] = [
  {
    id: "hero",
    labelRu: "Hero",
    labelEn: "Hero",
    mode: "hero",
    snapReady: false,
  },
  {
    id: "moa",
    labelRu: "MOA баннер",
    labelEn: "MOA banner",
    mode: "screen",
    snapReady: true,
  },
  {
    id: "promos",
    labelRu: "B2B и карта",
    labelEn: "B2B and map",
    mode: "screen",
    snapReady: true,
  },
  {
    id: "tours",
    labelRu: "Экскурсии",
    labelEn: "Tours",
    mode: "screen",
    snapReady: true,
  },
  {
    id: "menu",
    labelRu: "Меню разделов",
    labelEn: "Section menu",
    mode: "screen",
    snapReady: true,
  },
  {
    id: "blog",
    labelRu: "Блог",
    labelEn: "Blog",
    mode: "screen",
    snapReady: true,
  },
  {
    id: "newsletter",
    labelRu: "Подписка",
    labelEn: "Newsletter",
    mode: "screen",
    snapReady: true,
  },
] as const;
