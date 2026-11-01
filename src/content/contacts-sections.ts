/**
 * Stable section manifest for `/contacts` DS-3 template.
 * No prior public hashes on source — intentional new anchors.
 */

export type ContactsSectionId = "hero" | "details" | "form";

export type ContactsSectionDef = {
  id: ContactsSectionId;
  labelRu: string;
  mode: "banner" | "content";
  snap: boolean;
};

export const CONTACTS_SECTIONS: readonly ContactsSectionDef[] = [
  {
    id: "hero",
    labelRu: "Контакты",
    mode: "banner",
    snap: true,
  },
  {
    id: "details",
    labelRu: "Реквизиты и связь",
    mode: "content",
    snap: true,
  },
  {
    id: "form",
    labelRu: "Форма",
    mode: "content",
    snap: false,
  },
] as const;
