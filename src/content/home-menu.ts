import type { ExternalNavKey } from "@/lib/site-links";

export type HomeMenuCard = {
  id: string;
  titleKey: string;
  bodyKey: string;
  ctaKey: string;
  image: string;
  href:
    | {
        kind: "local";
        path: "/beer" | "/blog" | "/partnership" | "/tours" | "/map";
      }
    | { kind: "absolute"; path: string }
    | { kind: "external"; key: ExternalNavKey };
};

/**
 * Production ZB `749502712` card order (3×2):
 * beer / blog / partners · map / tours / shop.
 */
export const HOME_MENU_CARDS: HomeMenuCard[] = [
  {
    id: "beer",
    titleKey: "menuBeerTitle",
    bodyKey: "menuBeerBody",
    ctaKey: "menuBeerCta",
    image: "/home/menu-beer_.png",
    href: { kind: "local", path: "/beer" },
  },
  {
    id: "blog",
    titleKey: "menuBlogTitle",
    bodyKey: "menuBlogBody",
    ctaKey: "menuBlogCta",
    image: "/home/menu-blog_.png",
    href: { kind: "local", path: "/blog" },
  },
  {
    id: "partners",
    titleKey: "menuPartnersTitle",
    bodyKey: "menuPartnersBody",
    ctaKey: "menuPartnersCta",
    image: "/home/menu-partership_.png",
    href: { kind: "local", path: "/partnership" },
  },
  {
    id: "map",
    titleKey: "menuMapTitle",
    bodyKey: "menuMapBody",
    ctaKey: "menuMapCta",
    image: "/home/menu-map_.png",
    href: { kind: "local", path: "/map" },
  },
  {
    id: "tours",
    titleKey: "menuToursTitle",
    bodyKey: "menuToursBody",
    ctaKey: "menuToursCta",
    image: "/home/menu-tours_.png",
    href: { kind: "local", path: "/tours" },
  },
  {
    id: "shop",
    titleKey: "menuShopTitle",
    bodyKey: "menuShopBody",
    ctaKey: "menuShopCta",
    image: "/home/menu-shop_.png",
    /** Absolute RU path — EN peer unpublished. */
    href: { kind: "absolute", path: "/shop" },
  },
];
