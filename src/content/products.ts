import { sortAllViewOrder } from "@/content/listing-order";

/**
 * Catalog fixtures for `/beer` listing (cards/filters).
 * Categories/order/badges: **Confirmed** from owner CSV
 * `tmp/Gletcher beer groups.csv` (copied to docs/discovery/_raw/).
 * Unified listing+detail: `src/content/catalog.ts` (stable id + translations).
 * Raw props fixture: `product-props.ts` / `tmp/Gletcher beer categories and props.csv`.
 * UI filters: ALL / CLASSIC / CRAFT / LIMITED / AGING (Cynic).
 * Category key is `aging` (not `aged`). Owner CSV historically said AGED —
 * corrected to AGING by owner 2026-10-31.
 * ALL strip order: `listing-order.ts` (MCP ZB 802918687).
 */

export type ProductCategory = "classic" | "craft" | "limited" | "aging";

export type ProductBadge = "new" | "alcofree" | "discontinued";

export type CatalogProduct = {
  slug: string;
  name: string;
  /** Accessible name for the card link */
  title: string;
  category: ProductCategory;
  image: string;
  badges?: ProductBadge[];
  outOfStock?: boolean;
};

export const PRODUCT_FILTERS = [
  { id: "all", label: "ВСЕ" },
  { id: "classic", label: "CLASSIC" },
  { id: "craft", label: "CRAFT" },
  { id: "limited", label: "LIMITED" },
  { id: "aging", label: "AGING" },
] as const;

export type ProductFilterId = (typeof PRODUCT_FILTERS)[number]["id"];

const BOTTLE = {
  cynic: "/catalog/bottles/CATALOGUE__0018_CYNIC---bottle.png",
  milkNonAlco:
    "/catalog/bottles/CATALOGUE__0017_Milk-of-Amnesia-non-alcoholic---bottle.png",
  milk: "/catalog/bottles/CATALOGUE__0008_Milk-of-Amnesia---bottle.png",
  brainstorm: "/catalog/bottles/CATALOGUE__0013_Brainstorm---bottle.png",
  blueMonkey: "/catalog/bottles/CATALOGUE__0015_Blue-Monkey---bottle.png",
  nutButter: "/catalog/bottles/CATALOGUE__0007_Nut-Butter---bottle.png",
  bowler: "/catalog/bottles/CATALOGUE__0014_Bowler-IPA---bottle.png",
  underground: "/catalog/bottles/CATALOGUE__0003_Underground-Ale---bottle.png",
  friday: "/catalog/bottles/CATALOGUE__0012_Friday-Avenue---bottle.png",
  ironDry: "/catalog/bottles/CATALOGUE__0010_Iron-Woods---bottle.png",
  ironMilk: "/catalog/bottles/CATALOGUE__0009_Iron-Woods-Milk-Stout---bottle.png",
  ruby: "/catalog/bottles/CATALOGUE__0005_Ruby-Road---bottle.png",
  ausweis: "/catalog/bottles/CATALOGUE__0016_Ausweis---bottle.png",
  heidegger: "/catalog/bottles/CATALOGUE__0011_Heidegger-Hell---bottle.png",
  rouge: "/catalog/bottles/CATALOGUE__0006_Rouge-de-Fleur---bottle.png",
  brut: "/catalog/bottles/CATALOGUE__0002_Brut-Grapefruit---bottle.png",
  hopDragon: "/catalog/bottles/CATALOGUE__0001_Hop-Dragon---bottle.png",
  tour: "/catalog/bottles/CATALOGUE__0004_Tour-De-Grapefruit---bottle.png",
} as const;

/**
 * Order follows owner CSV within each category (metadata / filters).
 * ALL / category strip order: `listing-order.ts` (MCP ALL artboard `left`).
 */
export const CATALOG_PRODUCTS: CatalogProduct[] = [
  // AGING
  {
    slug: "cynic",
    name: "CYNIC",
    title: "Cynic Russian Imperial Stout",
    category: "aging",
    image: BOTTLE.cynic,
    badges: ["new"],
  },
  // CRAFT
  {
    slug: "milk-of-amnesia-non-alco",
    name: "Milk of Amnesia non-alcoholic",
    title: "Milk of Amnesia Non-Alcoholic Milkshake IPA",
    category: "craft",
    image: BOTTLE.milkNonAlco,
    badges: ["new", "alcofree"],
  },
  {
    slug: "milk-of-amnesia-v-tropic",
    name: "Milk of Amnesia",
    title: "Milk of Amnesia Milkshake IPA",
    category: "craft",
    image: BOTTLE.milk,
  },
  {
    slug: "brainstorm",
    name: "Brainstorm",
    title: "Brainstorm",
    category: "craft",
    image: BOTTLE.brainstorm,
    badges: ["alcofree"],
  },
  {
    slug: "blue-monkey",
    name: "Blue Monkey",
    title: "Blue Monkey",
    category: "craft",
    image: BOTTLE.blueMonkey,
  },
  {
    slug: "nut-butter",
    name: "Nut Butter",
    title: "Nut Butter",
    category: "craft",
    image: BOTTLE.nutButter,
  },
  {
    slug: "bowler-ipa",
    name: "Bowler IPA",
    title: "Bowler IPA",
    category: "craft",
    image: BOTTLE.bowler,
  },
  {
    slug: "underground-ale",
    name: "Underground Ale",
    title: "Underground Ale",
    category: "craft",
    image: BOTTLE.underground,
  },
  {
    slug: "friday-avenue-apa",
    name: "Friday Avenue",
    title: "Friday Avenue APA",
    category: "craft",
    image: BOTTLE.friday,
  },
  {
    slug: "iron-woods-dry-stout",
    name: "Iron Woods Dry Stout",
    title: "Iron Woods Dry Stout",
    category: "craft",
    image: BOTTLE.ironDry,
  },
  {
    slug: "iron-woods-milk-stout",
    name: "Iron Woods Milk Stout",
    title: "Iron Woods Milk Stout",
    category: "craft",
    image: BOTTLE.ironMilk,
    badges: ["discontinued"],
    outOfStock: true,
  },
  {
    slug: "ruby-road",
    name: "Ruby Road",
    title: "Ruby Road",
    category: "craft",
    image: BOTTLE.ruby,
  },
  // CLASSIC
  {
    slug: "ausweis",
    name: "Ausweis",
    title: "Ausweis",
    category: "classic",
    image: BOTTLE.ausweis,
  },
  {
    slug: "heidegger-hell",
    name: "Heidegger Hell",
    title: "Heidegger Hell",
    category: "classic",
    image: BOTTLE.heidegger,
  },
  {
    slug: "rouge-de-fleur",
    name: "Rouge de Fleur",
    title: "Rouge de Fleur",
    category: "classic",
    image: BOTTLE.rouge,
  },
  // LIMITED
  {
    slug: "brut-grapefruit",
    name: "Brut Grapefruit",
    title: "Brut Grapefruit",
    category: "limited",
    image: BOTTLE.brut,
    badges: ["discontinued"],
    outOfStock: true,
  },
  {
    slug: "hop-dragon",
    name: "Hop Dragon",
    title: "Hop Dragon",
    category: "limited",
    image: BOTTLE.hopDragon,
    badges: ["discontinued"],
    outOfStock: true,
  },
  {
    slug: "tour-de-grapefruit",
    name: "Tour de Grapefruit",
    title: "Tour de Grapefruit",
    category: "limited",
    image: BOTTLE.tour,
    badges: ["new"],
  },
];

/** ALL: NEW first, out-of-stock last; relative order from listing-order.ts. */
export function productsForAllView(
  products: CatalogProduct[] = CATALOG_PRODUCTS,
): CatalogProduct[] {
  return sortAllViewOrder(
    products.map((p) => ({
      id: p.slug,
      badges: p.badges,
      outOfStock: p.outOfStock,
      product: p,
    })),
  ).map((row) => row.product);
}

export function filterProducts(
  products: CatalogProduct[],
  filter: ProductFilterId,
): CatalogProduct[] {
  if (filter === "all") return productsForAllView(products);
  return productsForAllView(products.filter((p) => p.category === filter));
}
