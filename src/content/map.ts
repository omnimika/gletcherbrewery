/**
 * `/map` + `/en/map` — sales map (Mapbox GL).
 * Provenance: published HTML `page__map.html` / `page__en__map.html` (03.11.2026).
 * Filter property remains `Product` (singular). Token via env only.
 */

import type { PublishedLocale } from "@/i18n/locales";

export const MAP_PATH = "/map" as const;
export const MAP_PATH_EN = "/en/map" as const;

/** Pathnames for LocaleSwitch (no locale prefix — next-intl Link adds it). */
export const MAP_LOCALE_HREFS = {
  ru: MAP_PATH,
  en: MAP_PATH,
} as const;

/** Confirmed Mapbox style + camera from production HTML. */
export const MAP_STYLE = {
  styleUrl: "mapbox://styles/omnicoremaps/cknj3azmg0w2t17qqmylsfz8x",
  center: [50.291418, 53.343783] as [number, number],
  zoom: 3.52,
  projection: "globe" as const,
};

/** Retail layers in the hosted style (Confirmed). */
export const MAP_LAYERS = [
  "auchan-atak",
  "twoaxes-drinx-beruvykhodnoy",
  "selgros-miratorg-yabloko-5m7m",
  "winelab",
  "eurospar",
  "dixie",
  "metro-globus-okey",
  "azbuka",
  "perekrestok",
  "magnit",
  "lenta",
  "aromatny-mir",
  "maksi",
  "yarche",
  "hmel-i-solod",
] as const;

const IMAGE_BASE = "https://files.gletcherbrewery.com/map";

export type MapBeer = {
  key: string;
  imageFile: string;
  series: "classic" | "craft" | "limited" | "aging";
};

/** RU panel order (Confirmed). */
export const MAP_BEERS_RU: readonly MapBeer[] = [
  { key: "Ausweis", imageFile: "Ausweis.png", series: "classic" },
  { key: "Heidegger Hell", imageFile: "Heidegger Hell.png", series: "classic" },
  { key: "Rouge de Fleur", imageFile: "Rouge De Fleur.png", series: "classic" },
  { key: "Blue Monkey", imageFile: "Blue Monkey.png", series: "craft" },
  { key: "Bowler IPA", imageFile: "Bowler IPA.png", series: "craft" },
  { key: "Brainstorm", imageFile: "Brainstorm.png", series: "craft" },
  { key: "Friday Avenue", imageFile: "Friday Avenue.png", series: "craft" },
  { key: "Iron Woods", imageFile: "Iron Woods Dry Stout.png", series: "craft" },
  // Commented out on production map HTML: Iron Woods Milk Stout, Ruby Road.
  { key: "Nut Butter", imageFile: "Nut Butter.png", series: "craft" },
  { key: "Milk of Amnesia", imageFile: "Milk of Amnesia.png", series: "craft" },
  {
    key: "Milk of Amnesia non-alcoholic",
    imageFile: "Milk of Amnesia non-alcoholic.png",
    series: "craft",
  },
  {
    key: "Underground Ale",
    imageFile: "Underground Ale.png",
    series: "craft",
  },
  // Commented out on production: Brut Grapefruit, Hop Dragon.
  {
    key: "Tour De Grapefruit",
    imageFile: "Tour De Grapefruit.png",
    series: "limited",
  },
  { key: "CYNIC", imageFile: "CYNIC.png", series: "aging" },
];

/** EN panel omits NA Amnesia + CYNIC (Observed). */
export const MAP_BEERS_EN: readonly MapBeer[] = MAP_BEERS_RU.filter(
  (b) =>
    b.key !== "Milk of Amnesia non-alcoholic" && b.key !== "CYNIC",
);

export function mapBeerImageUrl(beer: MapBeer): string {
  return `${IMAGE_BASE}/${encodeURIComponent(beer.imageFile)}`;
}

export type MapCopy = {
  path: string;
  metaTitle: string;
  metaDescription: string;
  title: string;
  /** Hero line 1 (navy). */
  heroLead: string;
  /** Hero line 2 (light blue accent). */
  heroAccent: string;
  filterTitle: string;
  chainFilterTitle: string;
  beerFilterTitle: string;
  clearFiltersLabel: string;
  geocoderPlaceholder: string;
  fullscreenLabel: string;
  geolocateLabel: string;
  geolocateError: string;
  assortmentLabel: string;
  missingToken: string;
  loadError: string;
  retryLabel: string;
  productionFallbackHref: string;
  productionFallbackLabel: string;
  beers: readonly MapBeer[];
  seriesLabels: Record<MapBeer["series"], string>;
};

const RU: MapCopy = {
  path: MAP_PATH,
  metaTitle: "Карта Продаж | Пивоварня Глетчер",
  metaDescription:
    "Карта точек продаж Gletcher Brewery. Найдите магазин и попробуйте наше пиво.",
  title: "КАРТА ПРОДАЖ",
  heroLead: "Нашу продукцию можно приобрести в большинстве розничных сетей.",
  heroAccent: "Найдите ближайший к вам магазин и попробуйте наше пиво!",
  filterTitle: "Фильтры карты",
  chainFilterTitle: "Сети",
  beerFilterTitle: "Сорта",
  clearFiltersLabel: "Сбросить",
  geocoderPlaceholder: "Ввести адрес...",
  fullscreenLabel: "На весь экран",
  geolocateLabel: "Моё местоположение",
  geolocateError:
    "Не удалось определить местоположение. В Chrome нужен https:// или localhost, и разрешение «Геоданные» для этого сайта.",
  assortmentLabel: "Ассортимент:",
  missingToken:
    "Карта временно недоступна на этом сайте. Вы можете открыть рабочую карту на основном домене.",
  loadError:
    "Не удалось загрузить карту. Попробуйте ещё раз или откройте карту на основном сайте.",
  retryLabel: "Повторить",
  productionFallbackHref: "https://www.gletcherbrewery.com/map",
  productionFallbackLabel: "Открыть карту на gletcherbrewery.com",
  beers: MAP_BEERS_RU,
  seriesLabels: {
    classic: "Classic",
    craft: "Craft",
    limited: "Limited",
    aging: "Aging",
  },
};

const EN: MapCopy = {
  path: MAP_PATH_EN,
  metaTitle: "Map | Gletcher Brewery",
  metaDescription: "Here you can find our distribution network.",
  title: "SALES MAP",
  heroLead: "Our products can be purchased at most retail chains IN RUSSIA.",
  heroAccent: "Find the store closest to you and try our beer!",
  filterTitle: "Map filters",
  chainFilterTitle: "Chains",
  beerFilterTitle: "Beers",
  clearFiltersLabel: "Clear",
  geocoderPlaceholder: "Enter an address...",
  fullscreenLabel: "Fullscreen",
  geolocateLabel: "My location",
  geolocateError:
    "Could not get your location. Chrome needs https:// or localhost, and location permission for this site.",
  assortmentLabel: "Assortment:",
  missingToken:
    "The map is temporarily unavailable on this site. You can open the live map on the main domain.",
  loadError:
    "Could not load the map. Try again or open the map on the main site.",
  retryLabel: "Retry",
  productionFallbackHref: "https://www.gletcherbrewery.com/en/map",
  productionFallbackLabel: "Open map on gletcherbrewery.com",
  beers: MAP_BEERS_EN,
  seriesLabels: {
    classic: "Classic",
    craft: "Craft",
    limited: "Limited",
    aging: "Aging",
  },
};

export function getMapCopy(locale: PublishedLocale): MapCopy {
  return locale === "en" ? EN : RU;
}
