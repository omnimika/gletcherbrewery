/**
 * Feed shells with empty body → external campaign pages.
 * Full local landings deferred to Sprint 5 (events templates).
 * Until then listing cards link to production (or local when migrated).
 *
 * Provenance: Tilda MCP feeds_get_post + get_page_settings, 01.11.2026.
 */

import type { BlogCategoryId } from "@/content/blog-categories";

export type AliasShell = {
  id: string;
  categoryId: BlogCategoryId;
  categoryLabel: string;
  title: string;
  description: string;
  publishedAt: string;
  /** Production path (no origin). */
  productionPath: string;
  cover: { src: string; alt: string };
  /**
   * Local path when migrated; otherwise listing uses production absolute URL.
   */
  localPath?: string;
  notes: string;
};

export const ALIAS_SHELLS_RU: AliasShell[] = [
  {
    id: "brainstorm-moto-fest-2023-landing",
    categoryId: "events",
    categoryLabel: "МЕРОПРИЯТИЯ",
    title: "BRAINSTORM MOTO FEST 2023",
    description:
      "Приглашаем на фестиваль, который объединит сообщества мотоциклистов и всех любителей яркого, динамичного и запоминающегося отдыха и пройдет на территории Gletcher Brewery",
    publishedAt: "2023-07-05",
    productionPath: "/brainstorm-moto-fest-2023",
    cover: {
      src: "https://static.tildacdn.com/tild3633-3034-4565-a466-626631303431/photo_2023-05-31_163.jpeg",
      alt: "",
    },
    notes:
      "Feed `6nxnmf6ci1`; Tilda page `37060088` (~65 records). Full local page → Sprint 5.",
  },
  {
    id: "klin-may-fest-2023-landing",
    categoryId: "events",
    categoryLabel: "МЕРОПРИЯТИЯ",
    title: "КЛИН МАЙ ФЕСТ 2023",
    description:
      "Приглашаем всех любителей пива посетить крупнейший фестиваль ремесленного пивоварения в России! Все подробности о фестивале.",
    publishedAt: "2023-05-17",
    productionPath: "/klin-may-fest-2023",
    cover: {
      src: "https://static.tildacdn.com/tild6137-3261-4365-a566-383465353733/_2023_3.jpg",
      alt: "",
    },
    notes:
      "Feed `m72y3fi0l1`; Tilda page `36369657` unpublished + viewpassword. Public URL degraded. Results article already local (`klin-may-fest-2023-results`). Full landing → Sprint 5 if republished.",
  },
  {
    id: "ten-years",
    categoryId: "news",
    categoryLabel: "НОВОСТИ",
    title: "ВЫИГРАЙ ПРИЗЫ В ЧЕСТЬ 10-ЛЕТИЯ GLETCHER!",
    description:
      "В эту первую для нас круглую дату мы хотим подвести итоги, поблагодарить вас и раздать ценные подарки.",
    publishedAt: "2021-04-05",
    productionPath: "/10-years",
    cover: {
      src: "https://static.tildacdn.com/tild3334-6263-4339-b163-633738653339/D31A1884_.jpg",
      alt: "",
    },
    notes:
      "Feed `rubhsruj91`; Tilda page `17960662` (~39 records, contest). Full local page → Sprint 5 / archive decision.",
  },
];
