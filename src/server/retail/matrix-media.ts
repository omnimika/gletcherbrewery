/**
 * Staff map matrix media — logos from tmp/shop logos (copied to public/staff),
 * bierdeckel from Bierdeckel/PNG. Prefer `-sm` logos for compact thumbnails.
 */

const LOGO_BASE = "/staff/retail-logos";
const DECKEL_BASE = "/staff/bierdeckel";

/** Chain title (as in Sheet) → public `-sm` logo path */
const CHAIN_LOGO_BY_TITLE: Record<string, string> = {
  АШАН: `${LOGO_BASE}/auchan-sm.svg`,
  АТАК: `${LOGO_BASE}/atak-sm.svg`,
  "АЗБУКА ВКУСА": `${LOGO_BASE}/azbukavkusa-sm.svg`,
  "Беру Выходной!": `${LOGO_BASE}/beruvykhodnoy-sm.svg`,
  ВИНЛАБ: `${LOGO_BASE}/winelab-sm.svg`,
  "ДВА ТОПОРА": `${LOGO_BASE}/twoaxes-sm.svg`,
  ВКУСВИЛЛ: `${LOGO_BASE}/vkusvill-sm.svg`,
  ВЕРНЫЙ: `${LOGO_BASE}/verny-sm.svg`,
  GLOBUS: `${LOGO_BASE}/globus-sm.svg`,
  "ДА!": `${LOGO_BASE}/da-sm.svg`,
  ДИКСИ: `${LOGO_BASE}/dixie-sm.svg`,
  DRINX: `${LOGO_BASE}/drinx-sm.svg`,
  SELGROS: `${LOGO_BASE}/selgros-sm.svg`,
  ЛЕНТА: `${LOGO_BASE}/lenta-sm.svg`,
  ОКЕЙ: `${LOGO_BASE}/okey-sm.svg`,
  "ГИПЕР МАГНИТ": `${LOGO_BASE}/magnit-sm.svg`,
  METRO: `${LOGO_BASE}/metro-sm.svg`,
  МИРАТОРГ: `${LOGO_BASE}/miratorg-sm.svg`,
  ПЕРЕКРЁСТОК: `${LOGO_BASE}/perekrestok-sm.svg`,
  EuroSPAR: `${LOGO_BASE}/spar-sm.svg`,
  "EuroSPAR (Калининград)": `${LOGO_BASE}/spar-sm.svg`,
  "Яблоко (Крым)": `${LOGO_BASE}/yabloko-sm.svg`,
  "Ярче!": `${LOGO_BASE}/yarche-sm.svg`,
};

/** Catalog product slug → bierdeckel PNG (best available match). */
const BIERDECKEL_BY_SLUG: Record<string, string> = {
  ausweis: `${DECKEL_BASE}/Gletcher_Bierdeckel_Ausweis_400x400.png`,
  "blue-monkey": `${DECKEL_BASE}/Gletcher_Bierdeckel_BlueMonkey_400x400.png`,
  "bowler-ipa": `${DECKEL_BASE}/Gletcher_Bierdeckel_BowlerIPA_400x400.png`,
  brainstorm: `${DECKEL_BASE}/Gletcher_Bierdeckel_BrainStorm_400x400.png`,
  "friday-avenue-apa": `${DECKEL_BASE}/Gletcher_Bierdeckel_FridayAvenue_400x400.png`,
  "heidegger-hell": `${DECKEL_BASE}/Gletcher_Bierdeckel_HeideggerHell_400x400.png`,
  "iron-woods-dry-stout": `${DECKEL_BASE}/Gletcher_Bierdeckel_IronWoods_400x400.png`,
  "iron-woods-milk-stout": `${DECKEL_BASE}/Gletcher_Bierdeckel_IronWoodsMilkStout_400x400.png`,
  "nut-butter": `${DECKEL_BASE}/Gletcher_Bierdeckel_NutButter_400x400.png`,
  "milk-of-amnesia-v-tropic": `${DECKEL_BASE}/Gletcher_Bierdeckel_MilkOfAmnesia_400x400.png`,
  "milk-of-amnesia-non-alco": `${DECKEL_BASE}/Gletcher_Bierdeckel_MilkOfAmnesiaNon-alcoholic_400x400.png`,
  "rouge-de-fleur": `${DECKEL_BASE}/Gletcher_Bierdeckel_RougeDeFleur_400x400.png`,
  "ruby-road": `${DECKEL_BASE}/Gletcher_Bierdeckel_RubyRoad_400x400.png`,
  "underground-ale": `${DECKEL_BASE}/Gletcher_Bierdeckel_UndergroundALE_400x400.png`,
  "hop-dragon": `${DECKEL_BASE}/Gletcher_Bierdeckel_HOP_400x400.png`,
  "brut-grapefruit": `${DECKEL_BASE}/Gletcher_Bierdeckel_BrutGrapefruit_400x400.png`,
  "tour-de-grapefruit": `${DECKEL_BASE}/Gletcher_Bierdeckel_TourDeGrape_400x400.png`,
  cynic: `${DECKEL_BASE}/Gletcher_Bierdeckel_CYNIC_400x400.png`,
};

export function chainLogoSrc(title: string): string | null {
  return CHAIN_LOGO_BY_TITLE[title] ?? null;
}

export function productBierdeckelSrc(productSlug: string): string | null {
  return BIERDECKEL_BY_SLUG[productSlug] ?? null;
}
