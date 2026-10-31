/**
 * Local cover / wordmark paths under `public/catalog/{covers,logos}`.
 * Filenames mirror `assets/catalog` delivery (spaces allowed in public URLs).
 * Missing cover → hero falls back to bottle shot.
 */
export type ProductMedia = {
  cover?: string;
  logo?: string;
  /** Pint glass for bottle hover on the detail content block. */
  glass?: string;
  /**
   * Some delivered covers already bake in the yellow wordmark (e.g. Friday Avenue).
   * Skip the logo overlay there to avoid double title.
   */
  coverHasWordmark?: boolean;
};

/** Paths keep spaces; Next/Image and the browser encode on request. */
function cover(name: string): string {
  return `/catalog/covers/${name}.png`;
}

function logo(name: string, ext: "svg" | "png" = "svg"): string {
  return `/catalog/logos/${name}.${ext}`;
}

function glass(productId: string): string {
  return `/catalog/glasses/${productId}.png`;
}

export const PRODUCT_MEDIA: Record<string, ProductMedia> = {
  ausweis: {
    cover: cover("Ausweis"),
    logo: logo("Ausweis"),
    glass: glass("ausweis"),
  },
  "heidegger-hell": {
    cover: cover("Heidegger Hell"),
    logo: logo("Heidegger Hell"),
    glass: glass("heidegger-hell"),
  },
  "rouge-de-fleur": {
    cover: cover("Rouge de Fleur"),
    logo: logo("Rouge de Fleur"),
    glass: glass("rouge-de-fleur"),
  },
  "milk-of-amnesia-non-alco": {
    cover: cover("Milk of Amnesia"),
    logo: logo("Milk of Amnesia"),
    glass: glass("milk-of-amnesia-non-alco"),
  },
  "milk-of-amnesia-v-tropic": {
    cover: cover("Milk of Amnesia"),
    logo: logo("Milk of Amnesia"),
    glass: glass("milk-of-amnesia-v-tropic"),
  },
  brainstorm: {
    cover: cover("Brainstorm"),
    logo: logo("Brainstorm"),
    glass: glass("brainstorm"),
  },
  "blue-monkey": {
    cover: cover("Blue Monkey"),
    logo: logo("Blue Monkey"),
    glass: glass("blue-monkey"),
  },
  "nut-butter": {
    cover: cover("Nut Butter"),
    logo: logo("Nut Butter"),
    glass: glass("nut-butter"),
  },
  "bowler-ipa": {
    cover: cover("Bowler IPA"),
    logo: logo("Bowler IPA"),
    glass: glass("bowler-ipa"),
  },
  "underground-ale": {
    cover: cover("Underground Ale"),
    logo: logo("Underground Ale"),
    // No glass in delivery yet
  },
  "friday-avenue-apa": {
    cover: cover("Friday Avenue"),
    logo: logo("Friday Avenue"),
    glass: glass("friday-avenue-apa"),
    coverHasWordmark: true,
  },
  "iron-woods-dry-stout": {
    cover: cover("Iron Woods"),
    logo: logo("Iron Woods Dry Stout"),
    glass: glass("iron-woods-dry-stout"),
  },
  "iron-woods-milk-stout": {
    cover: cover("Iron Woods Milk Stout"),
    logo: logo("Iron Woods Milk Stout"),
    glass: glass("iron-woods-milk-stout"),
  },
  "ruby-road": {
    cover: cover("Ruby Road"),
    logo: logo("Ruby Road"),
    glass: glass("ruby-road"),
  },
  "brut-grapefruit": {
    cover: cover("Brut Grapefruit"),
    logo: logo("Brut Grapefruit"),
  },
  "hop-dragon": {
    cover: cover("Hop Dragon"),
    logo: logo("Hop Dragon"),
    glass: glass("hop-dragon"),
  },
  "tour-de-grapefruit": {
    cover: cover("Tour de Grapefruit"),
    logo: logo("Tour De Grapefruit"),
  },
  // No dedicated cover/logo/glass in assets delivery yet
  cynic: {},
};

export function getProductMedia(productId: string): ProductMedia {
  return PRODUCT_MEDIA[productId] ?? {};
}
