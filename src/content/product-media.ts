/**
 * Local cover / wordmark / glass paths under `public/products/{slug}/`.
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

function asset(productId: string, file: string): string {
  return `/products/${productId}/${file}`;
}

export const PRODUCT_MEDIA: Record<string, ProductMedia> = {
  ausweis: {
    cover: asset("ausweis", "cover.png"),
    logo: asset("ausweis", "logo.svg"),
    glass: asset("ausweis", "glass.png"),
  },
  "heidegger-hell": {
    cover: asset("heidegger-hell", "cover.png"),
    logo: asset("heidegger-hell", "logo.svg"),
    glass: asset("heidegger-hell", "glass.png"),
  },
  "rouge-de-fleur": {
    cover: asset("rouge-de-fleur", "cover.png"),
    logo: asset("rouge-de-fleur", "logo.svg"),
    glass: asset("rouge-de-fleur", "glass.png"),
  },
  "milk-of-amnesia-non-alco": {
    cover: asset("milk-of-amnesia-non-alco", "cover.png"),
    logo: asset("milk-of-amnesia-non-alco", "logo.svg"),
    glass: asset("milk-of-amnesia-non-alco", "glass.png"),
  },
  "milk-of-amnesia-v-tropic": {
    cover: asset("milk-of-amnesia-v-tropic", "cover.png"),
    logo: asset("milk-of-amnesia-v-tropic", "logo.svg"),
    glass: asset("milk-of-amnesia-v-tropic", "glass.png"),
  },
  brainstorm: {
    cover: asset("brainstorm", "cover.png"),
    logo: asset("brainstorm", "logo.svg"),
    glass: asset("brainstorm", "glass.png"),
  },
  "blue-monkey": {
    cover: asset("blue-monkey", "cover.png"),
    logo: asset("blue-monkey", "logo.svg"),
    glass: asset("blue-monkey", "glass.png"),
  },
  "nut-butter": {
    cover: asset("nut-butter", "cover.png"),
    logo: asset("nut-butter", "logo.svg"),
    glass: asset("nut-butter", "glass.png"),
  },
  "bowler-ipa": {
    cover: asset("bowler-ipa", "cover.png"),
    logo: asset("bowler-ipa", "logo.svg"),
    glass: asset("bowler-ipa", "glass.png"),
  },
  "underground-ale": {
    cover: asset("underground-ale", "cover.png"),
    logo: asset("underground-ale", "logo.svg"),
    // No glass in delivery yet
  },
  "friday-avenue-apa": {
    cover: asset("friday-avenue-apa", "cover.png"),
    logo: asset("friday-avenue-apa", "logo.svg"),
    glass: asset("friday-avenue-apa", "glass.png"),
    coverHasWordmark: true,
  },
  "iron-woods-dry-stout": {
    cover: asset("iron-woods-dry-stout", "cover.png"),
    logo: asset("iron-woods-dry-stout", "logo.svg"),
    glass: asset("iron-woods-dry-stout", "glass.png"),
  },
  "iron-woods-milk-stout": {
    cover: asset("iron-woods-milk-stout", "cover.png"),
    logo: asset("iron-woods-milk-stout", "logo.svg"),
    glass: asset("iron-woods-milk-stout", "glass.png"),
  },
  "ruby-road": {
    cover: asset("ruby-road", "cover.png"),
    logo: asset("ruby-road", "logo.svg"),
    glass: asset("ruby-road", "glass.png"),
  },
  "brut-grapefruit": {
    cover: asset("brut-grapefruit", "cover.png"),
    logo: asset("brut-grapefruit", "logo.svg"),
  },
  "hop-dragon": {
    cover: asset("hop-dragon", "cover.png"),
    logo: asset("hop-dragon", "logo.svg"),
    glass: asset("hop-dragon", "glass.png"),
  },
  "tour-de-grapefruit": {
    cover: asset("tour-de-grapefruit", "cover.png"),
    logo: asset("tour-de-grapefruit", "logo.svg"),
  },
  // No dedicated cover/logo/glass in assets delivery yet
  cynic: {},
};

export function getProductMedia(productId: string): ProductMedia {
  return PRODUCT_MEDIA[productId] ?? {};
}
