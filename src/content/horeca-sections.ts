/**
 * Stable section manifest for `/horeca` DS-2 pilot.
 * IDs are public deep-link targets; keep stable once published.
 * No prior hash fragments on source — these are new, intentional anchors.
 */

export type HorecaSectionId =
  | "hero"
  | "compare"
  | "audience"
  | "distribution"
  | "request";

export type HorecaSectionDef = {
  id: HorecaSectionId;
  /** RU label for in-page nav / a11y. */
  labelRu: string;
  mode: "screen" | "content" | "banner";
  layout: "hero-custom" | "card-grid" | "halves-x" | "form-halves";
  snap: boolean;
};

export const HORECA_SECTIONS: readonly HorecaSectionDef[] = [
  {
    id: "hero",
    labelRu: "Hero HoReCa",
    mode: "screen",
    layout: "hero-custom",
    snap: true,
  },
  {
    id: "compare",
    labelRu: "Сравнение сортов",
    mode: "content",
    layout: "card-grid",
    snap: true,
  },
  {
    id: "audience",
    labelRu: "Кому подходит",
    mode: "content",
    layout: "halves-x",
    snap: true,
  },
  {
    id: "distribution",
    labelRu: "Дистрибуция",
    mode: "content",
    layout: "halves-x",
    snap: true,
  },
  {
    id: "request",
    labelRu: "Заявка",
    mode: "content",
    layout: "form-halves",
    snap: false,
  },
] as const;
