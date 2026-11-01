/**
 * Stable section manifest for `/partnership`, `/en/partnership`,
 * and `/russian-craft-beer` (shared PartnershipPageView).
 * No prior public hashes on source — intentional new anchors.
 * Pillars / materials may be absent per copy variant; filter before nav.
 */

export type PartnershipSectionId =
  | "hero"
  | "pillars"
  | "materials"
  | "request";

export type PartnershipSectionDef = {
  id: PartnershipSectionId;
  labelRu: string;
  labelEn: string;
  mode: "content";
  snap: boolean;
};

export const PARTNERSHIP_SECTIONS: readonly PartnershipSectionDef[] = [
  {
    id: "hero",
    labelRu: "О партнёрстве",
    labelEn: "About",
    mode: "content",
    snap: true,
  },
  {
    id: "pillars",
    labelRu: "Преимущества",
    labelEn: "Benefits",
    mode: "content",
    snap: true,
  },
  {
    id: "materials",
    labelRu: "Материалы",
    labelEn: "Materials",
    mode: "content",
    snap: true,
  },
  {
    id: "request",
    labelRu: "Заявка",
    labelEn: "Enquiry",
    mode: "content",
    snap: false,
  },
] as const;
