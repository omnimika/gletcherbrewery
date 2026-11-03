import type { ZbSbsStep } from "@/components/agent/zb-motion";

/** Identity placeholder — first SBS step in every Tilda sequence. */
const ID: ZbSbsStep = {
  mx: 0,
  my: 0,
  sx: 1,
  sy: 1,
  op: 1,
  ro: 0,
  ti: 0,
  ea: "0",
  dt: 0,
};

/** Hero seal — ZB 711680591, sbsevent blockintoview, sbstrg 1. */
export const HERO_SEAL_SBS: ZbSbsStep[] = [
  ID,
  { mx: 0, my: 0, sx: 1, sy: 1, op: 0, ro: 0, ti: 0, ea: "easeOut", dt: 0 },
  {
    mx: 0,
    my: 0,
    sx: 1,
    sy: 1,
    op: 1,
    ro: -120,
    ti: 500,
    ea: "",
    dt: 1000,
  },
];

/** Purchases — scale-in on blockintoview sbstrg 0.5. */
export const PURCHASES_KICKER_SBS: ZbSbsStep[] = [
  ID,
  { mx: 0, my: -30, sx: 0, sy: 0, op: 0, ro: 0, ti: 0, ea: "0", dt: 0 },
  { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: 0, ti: 500, ea: "0", dt: 0 },
];

export const PURCHASES_TITLE_SBS: ZbSbsStep[] = [
  ID,
  { mx: 0, my: -30, sx: 0, sy: 0, op: 0, ro: 0, ti: 0, ea: "0", dt: 0 },
  { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: 0, ti: 500, ea: "0", dt: 100 },
];

/** Ghost «ПОКУПК» opacity beat then solid. */
export const PURCHASES_GHOST_SBS: ZbSbsStep[] = [
  ID,
  { mx: 0, my: -30, sx: 0, sy: 0, op: 0, ro: 0, ti: 0, ea: "0", dt: 0 },
  { mx: 0, my: 0, sx: 1, sy: 1, op: 0, ro: 0, ti: 300, ea: "0", dt: 100 },
  { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: 0, ti: 500, ea: "0", dt: 100 },
];

export const COINS_KICKER_SBS: ZbSbsStep[] = [
  ID,
  { mx: 0, my: -30, sx: 0, sy: 0, op: 0, ro: 0, ti: 0, ea: "0", dt: 0 },
  { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: 0, ti: 500, ea: "0", dt: 0 },
];

export const COINS_TITLE_SBS: ZbSbsStep[] = [
  ID,
  { mx: 0, my: -30, sx: 0, sy: 0, op: 0, ro: 0, ti: 0, ea: "0", dt: 0 },
  { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: 0, ti: 500, ea: "0", dt: 100 },
];

/** Coin stickers — bounceFin into view (from-states differ per sticker). */
export const COIN_BOUNCE_SBS: ZbSbsStep[][] = [
  [
    ID,
    {
      mx: -5,
      my: 70,
      sx: 0.9,
      sy: 0.9,
      op: 0,
      ro: -36,
      ti: 0,
      ea: "0",
      dt: 0,
    },
    {
      mx: 0,
      my: 0,
      sx: 1,
      sy: 1,
      op: 1,
      ro: 5,
      ti: 400,
      ea: "bounceFin",
      dt: 800,
    },
  ],
  [
    ID,
    {
      mx: -150,
      my: 50,
      sx: 0.9,
      sy: 0.9,
      op: 0,
      ro: 61,
      ti: 0,
      ea: "",
      dt: 0,
    },
    {
      mx: 0,
      my: 0,
      sx: 1,
      sy: 1,
      op: 1,
      ro: 5,
      ti: 400,
      ea: "bounceFin",
      dt: 800,
    },
  ],
  [
    ID,
    {
      mx: -20,
      my: 50,
      sx: 0.9,
      sy: 0.9,
      op: 0,
      ro: -36,
      ti: 0,
      ea: "0",
      dt: 0,
    },
    {
      mx: 0,
      my: 0,
      sx: 1,
      sy: 1,
      op: 1,
      ro: 5,
      ti: 400,
      ea: "bounceFin",
      dt: 800,
    },
  ],
  [
    ID,
    {
      mx: 50,
      my: 50,
      sx: 0.9,
      sy: 0.9,
      op: 0,
      ro: 0,
      ti: 0,
      ea: "0",
      dt: 0,
    },
    {
      mx: 0,
      my: 0,
      sx: 1,
      sy: 1,
      op: 1,
      ro: 5,
      ti: 400,
      ea: "bounceFin",
      dt: 800,
    },
  ],
  [
    ID,
    {
      mx: 50,
      my: 50,
      sx: 0.9,
      sy: 0.9,
      op: 0,
      ro: -5,
      ti: 0,
      ea: "0",
      dt: 0,
    },
    {
      mx: 0,
      my: 0,
      sx: 1,
      sy: 1,
      op: 1,
      ro: 5,
      ti: 400,
      ea: "bounceFin",
      dt: 800,
    },
  ],
];

export const PARTNER_TITLE_SBS: ZbSbsStep[] = [
  ID,
  { mx: 0, my: -30, sx: 0, sy: 0, op: 0, ro: 0, ti: 0, ea: "0", dt: 0 },
  { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: 0, ti: 500, ea: "0", dt: 0 },
];

export const PARTNER_SUB_SBS: ZbSbsStep[] = [
  ID,
  { mx: 0, my: -30, sx: 0, sy: 0, op: 0, ro: 0, ti: 0, ea: "0", dt: 0 },
  { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: 0, ti: 500, ea: "0", dt: 100 },
];

export const STATUS_KICKER_SBS: ZbSbsStep[] = [
  ID,
  { mx: 0, my: -30, sx: 0, sy: 0, op: 0, ro: 0, ti: 0, ea: "0", dt: 0 },
  { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: 0, ti: 500, ea: "0", dt: 0 },
];

export const STATUS_TITLE_SBS: ZbSbsStep[] = [
  ID,
  { mx: 0, my: -30, sx: 0, sy: 0, op: 0, ro: 0, ti: 0, ea: "0", dt: 0 },
  { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: 0, ti: 500, ea: "0", dt: 100 },
];

export const STATUS_SUB_SBS: ZbSbsStep[] = [
  ID,
  { mx: 0, my: -30, sx: 0, sy: 0, op: 0, ro: 0, ti: 0, ea: "0", dt: 0 },
  { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: 0, ti: 500, ea: "0", dt: 100 },
];
