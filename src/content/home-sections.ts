/**
 * Stable section manifest for home DS-3 rollout.
 * Snap only on bands that left HomeWindowStage (transform scale breaks proximity).
 */

export type HomeSectionId =
  | "hero"
  | "moa"
  | "promos"
  | "tours"
  | "menu"
  | "blog"
  | "newsletter";

export type HomeSectionDef = {
  id: HomeSectionId;
  labelRu: string;
  labelEn: string;
  /** Soft snap not enabled on home until window-stage exit. */
  snapReady: boolean;
};

export const HOME_SECTIONS: readonly HomeSectionDef[] = [
  {
    id: "hero",
    labelRu: "Hero",
    labelEn: "Hero",
    snapReady: false,
  },
  {
    id: "moa",
    labelRu: "MOA баннер",
    labelEn: "MOA banner",
    snapReady: true,
  },
  {
    id: "promos",
    labelRu: "B2B и карта",
    labelEn: "B2B and map",
    snapReady: false,
  },
  {
    id: "tours",
    labelRu: "Экскурсии",
    labelEn: "Tours",
    snapReady: false,
  },
  {
    id: "menu",
    labelRu: "Меню разделов",
    labelEn: "Section menu",
    snapReady: false,
  },
  {
    id: "blog",
    labelRu: "Блог",
    labelEn: "Blog",
    snapReady: false,
  },
  {
    id: "newsletter",
    labelRu: "Подписка",
    labelEn: "Newsletter",
    snapReady: false,
  },
] as const;
