/**
 * Reorganize public/ media into human-readable layout:
 *   products/{slug}/{bottle,glass,cover,logo,bierdeckel,pricetag,...}
 *   blog/{article-slug}/{cover,01,02,...}
 *   pages/{about,home,agent,tours,partnership,shop,horeca,contacts,blog-misc}/
 *
 * Usage: node scripts/reorganize-public-media.mjs [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const DRY = process.argv.includes("--dry-run");
const MEDIA_MAP = {};

function ensureDir(d) {
  if (!DRY) fs.mkdirSync(d, { recursive: true });
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) return false;
  ensureDir(path.dirname(dest));
  if (!DRY) fs.copyFileSync(src, dest);
  return true;
}

function moveTree(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(path.dirname(dest));
  if (DRY) return;
  if (fs.existsSync(dest)) {
    // merge: copy contents
    for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
      const s = path.join(src, ent.name);
      const d = path.join(dest, ent.name);
      if (ent.isDirectory()) moveTree(s, d);
      else {
        ensureDir(path.dirname(d));
        fs.copyFileSync(s, d);
      }
    }
  } else {
    fs.renameSync(src, dest);
  }
}

function record(oldUrl, newUrl) {
  MEDIA_MAP[oldUrl] = newUrl;
}

function walkFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

function readTextFiles() {
  const files = [];
  const roots = [path.join(ROOT, "src"), path.join(ROOT, "next.config.ts")];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    if (fs.statSync(root).isFile()) {
      files.push(root);
      continue;
    }
    for (const f of walkFiles(root)) {
      if (/\.(ts|tsx|js|jsx|mjs|json|css|md)$/.test(f)) files.push(f);
    }
  }
  return files;
}

// ——— Product kit assembly ———

const PRODUCTS = [
  {
    slug: "ausweis",
    bottle: "CATALOGUE__0016_Ausweis---bottle.png",
    cover: "Ausweis.png",
    logo: "Ausweis.svg",
    glass: "ausweis.png",
    bierdeckel: "Gletcher_Bierdeckel_Ausweis_400x400.png",
    pricetag: "Gletcher_beer_Ausweis_A5_OUT.pdf",
  },
  {
    slug: "heidegger-hell",
    bottle: "CATALOGUE__0011_Heidegger-Hell---bottle.png",
    cover: "Heidegger Hell.png",
    logo: "Heidegger Hell.svg",
    glass: "heidegger-hell.png",
    bierdeckel: "Gletcher_Bierdeckel_HeideggerHell_400x400.png",
    pricetag: "Gletcher_beer_HeideggerHell_A5_OUT.pdf",
  },
  {
    slug: "rouge-de-fleur",
    bottle: "CATALOGUE__0006_Rouge-de-Fleur---bottle.png",
    cover: "Rouge de Fleur.png",
    logo: "Rouge de Fleur.svg",
    glass: "rouge-de-fleur.png",
    bierdeckel: "Gletcher_Bierdeckel_RougeDeFleur_400x400.png",
    pricetag: "Gletcher_beer_RougeDeFleur_A5_OUT.pdf",
  },
  {
    slug: "milk-of-amnesia-v-tropic",
    bottle: "CATALOGUE__0008_Milk-of-Amnesia---bottle.png",
    cover: "Milk of Amnesia.png",
    logo: "Milk of Amnesia.svg",
    glass: "milk-of-amnesia-v-tropic.png",
    bierdeckel: "Gletcher_Bierdeckel_MilkOfAmnesia_400x400.png",
    pricetag: "Gletcher_beer_MilkOfAmnesia_A5_OUT.pdf",
  },
  {
    slug: "milk-of-amnesia-non-alco",
    bottle: "CATALOGUE__0017_Milk-of-Amnesia-non-alcoholic---bottle.png",
    cover: "Milk of Amnesia.png",
    logo: "Milk of Amnesia.svg",
    glass: "milk-of-amnesia-non-alco.png",
    bierdeckel: "Gletcher_Bierdeckel_MilkOfAmnesia_400x400.png",
    pricetag: "Gletcher_beer_MilkOfAmnesia_A5_OUT.pdf",
  },
  {
    slug: "brainstorm",
    bottle: "CATALOGUE__0013_Brainstorm---bottle.png",
    cover: "Brainstorm.png",
    logo: "Brainstorm.svg",
    glass: "brainstorm.png",
    bierdeckel: "Gletcher_Bierdeckel_BrainStorm_400x400.png",
    pricetag: "Gletcher_beer_BrainStorm_A5_OUT.pdf",
  },
  {
    slug: "blue-monkey",
    bottle: "CATALOGUE__0015_Blue-Monkey---bottle.png",
    cover: "Blue Monkey.png",
    logo: "Blue Monkey.svg",
    glass: "blue-monkey.png",
    bierdeckel: "Gletcher_Bierdeckel_BlueMonkey_400x400.png",
    pricetag: "Gletcher_beer_BlueMonkey_A5_OUT.pdf",
  },
  {
    slug: "nut-butter",
    bottle: "CATALOGUE__0007_Nut-Butter---bottle.png",
    cover: "Nut Butter.png",
    logo: "Nut Butter.svg",
    glass: "nut-butter.png",
    bierdeckel: "Gletcher_Bierdeckel_NutButter_400x400.png",
    pricetag: "Gletcher_beer_NutButter_A5_OUT.pdf",
  },
  {
    slug: "bowler-ipa",
    bottle: "CATALOGUE__0014_Bowler-IPA---bottle.png",
    cover: "Bowler IPA.png",
    logo: "Bowler IPA.svg",
    glass: "bowler-ipa.png",
    bierdeckel: "Gletcher_Bierdeckel_BowlerIPA_400x400.png",
    pricetag: "Gletcher_beer_BowlerIPA_A5_OUT.pdf",
  },
  {
    slug: "underground-ale",
    bottle: "CATALOGUE__0003_Underground-Ale---bottle.png",
    cover: "Underground Ale.png",
    logo: "Underground Ale.svg",
    bierdeckel: "Gletcher_Bierdeckel_UndergroundALE_400x400.png",
    pricetag: "Gletcher_beer_UndergroundALE_A5_OUT.pdf",
  },
  {
    slug: "friday-avenue-apa",
    bottle: "CATALOGUE__0012_Friday-Avenue---bottle.png",
    cover: "Friday Avenue.png",
    logo: "Friday Avenue.svg",
    glass: "friday-avenue-apa.png",
    bierdeckel: "Gletcher_Bierdeckel_FridayAvenue_400x400.png",
    pricetag: "Gletcher_beer_FridayAvenue_A5_OUT.pdf",
  },
  {
    slug: "iron-woods-dry-stout",
    bottle: "CATALOGUE__0010_Iron-Woods---bottle.png",
    cover: "Iron Woods.png",
    logo: "Iron Woods Dry Stout.svg",
    glass: "iron-woods-dry-stout.png",
    bierdeckel: "Gletcher_Bierdeckel_IronWoods_400x400.png",
    pricetag: "Gletcher_beer_IronWoods_A5_OUT.pdf",
  },
  {
    slug: "iron-woods-milk-stout",
    bottle: "CATALOGUE__0009_Iron-Woods-Milk-Stout---bottle.png",
    cover: "Iron Woods Milk Stout.png",
    logo: "Iron Woods Milk Stout.svg",
    glass: "iron-woods-milk-stout.png",
    bierdeckel: "Gletcher_Bierdeckel_IronWoods_400x400.png",
    pricetag: "Gletcher_beer_IronWoods_A5_OUT.pdf",
  },
  {
    slug: "ruby-road",
    bottle: "CATALOGUE__0005_Ruby-Road---bottle.png",
    cover: "Ruby Road.png",
    logo: "Ruby Road.svg",
    glass: "ruby-road.png",
    bierdeckel: "Gletcher_Bierdeckel_RubyRoad_400x400.png",
    pricetag: "Gletcher_beer_RubyRoad_A5_OUT.pdf",
  },
  {
    slug: "brut-grapefruit",
    bottle: "CATALOGUE__0002_Brut-Grapefruit---bottle.png",
    bottleOos: "CATALOGUE__0002_Brut-Grapefruit---bottle-OUTOFSTOCK.png",
    cover: "Brut Grapefruit.png",
    logo: "Brut Grapefruit.svg",
    bierdeckel: "Gletcher_Bierdeckel_BrutGrapefruit_400x400.png",
  },
  {
    slug: "hop-dragon",
    bottle: "CATALOGUE__0001_Hop-Dragon---bottle.png",
    bottleOos: "CATALOGUE__0001_Hop-Dragon---bottle-OUTOFSTOCK.png",
    cover: "Hop Dragon.png",
    logo: "Hop Dragon.svg",
    glass: "hop-dragon.png",
    bierdeckel: "Gletcher_Bierdeckel_HOP_400x400.png",
  },
  {
    slug: "tour-de-grapefruit",
    bottle: "CATALOGUE__0004_Tour-De-Grapefruit---bottle.png",
    cover: "Tour de Grapefruit.png",
    logo: "Tour De Grapefruit.svg",
    bierdeckel: "Gletcher_Bierdeckel_TourDeGrape_400x400.png",
  },
  {
    slug: "cynic",
    bottle: "CATALOGUE__0018_CYNIC---bottle.png",
  },
];

function assembleProducts() {
  const report = { ok: 0, missing: [] };
  for (const p of PRODUCTS) {
    const destDir = path.join(PUBLIC, "products", p.slug);
    ensureDir(destDir);

    const mappings = [
      [p.bottle, "bottle.png", path.join(PUBLIC, "catalog", "bottles", p.bottle)],
      [
        p.bottleOos,
        "bottle-oos.png",
        p.bottleOos
          ? path.join(PUBLIC, "catalog", "bottles", p.bottleOos)
          : null,
      ],
      [
        p.cover,
        "cover.png",
        p.cover ? path.join(PUBLIC, "catalog", "covers", p.cover) : null,
      ],
      [
        p.logo,
        p.logo?.endsWith(".png") ? "logo.png" : "logo.svg",
        p.logo ? path.join(PUBLIC, "catalog", "logos", p.logo) : null,
      ],
      [
        p.glass,
        "glass.png",
        p.glass ? path.join(PUBLIC, "catalog", "glasses", p.glass) : null,
      ],
      [
        p.bierdeckel,
        "bierdeckel.png",
        p.bierdeckel
          ? path.join(
              ROOT,
              "tmp/Gletcher-Brewery-Bottles-Images/Bierdeckel/PNG",
              p.bierdeckel,
            )
          : null,
      ],
      [
        p.pricetag,
        "pricetag.pdf",
        p.pricetag
          ? path.join(ROOT, "tmp/Gletcher Brewery - ценники A5", p.pricetag)
          : null,
      ],
    ];

    for (const [srcName, destName, srcPath] of mappings) {
      if (!srcName || !srcPath) continue;
      const dest = path.join(destDir, destName);
      if (copyFile(srcPath, dest)) {
        report.ok += 1;
        if (srcPath.includes(`${path.sep}catalog${path.sep}`)) {
          const oldUrl = `/catalog/${path
            .relative(path.join(PUBLIC, "catalog"), srcPath)
            .split(path.sep)
            .join("/")}`;
          record(oldUrl, `/products/${p.slug}/${destName}`);
        }
      } else {
        report.missing.push(`${p.slug}:${destName} <- ${srcPath}`);
      }
    }

    // Also map CATALOGUE bottle URL variants used in content
    if (p.bottle) {
      record(
        `/catalog/bottles/${p.bottle}`,
        `/products/${p.slug}/bottle.png`,
      );
    }
    if (p.bottleOos) {
      record(
        `/catalog/bottles/${p.bottleOos}`,
        `/products/${p.slug}/bottle-oos.png`,
      );
    }
    if (p.cover) {
      record(`/catalog/covers/${p.cover}`, `/products/${p.slug}/cover.png`);
    }
    if (p.logo) {
      const logoName = p.logo.endsWith(".png") ? "logo.png" : "logo.svg";
      record(`/catalog/logos/${p.logo}`, `/products/${p.slug}/${logoName}`);
      // png twin often exists
      const pngTwin = p.logo.replace(/\.svg$/, ".png");
      if (pngTwin !== p.logo) {
        record(`/catalog/logos/${pngTwin}`, `/products/${p.slug}/logo.svg`);
      }
    }
    if (p.glass) {
      record(`/catalog/glasses/${p.glass}`, `/products/${p.slug}/glass.png`);
    }
  }
  return report;
}

// ——— Relocate page trees ———

function relocatePages() {
  const moves = [
    ["about", "pages/about"],
    ["home", "pages/home"],
    ["agent", "pages/agent"],
    ["tours", "pages/tours"],
  ];
  for (const [from, to] of moves) {
    const src = path.join(PUBLIC, from);
    const dest = path.join(PUBLIC, to);
    if (!fs.existsSync(src)) continue;
    console.log(`move ${from}/ → ${to}/`);
    moveTree(src, dest);
    if (!DRY && fs.existsSync(src) && src !== dest) {
      fs.rmSync(src, { recursive: true, force: true });
    }
    // Do NOT record bare prefixes like /home/ → /pages/home/ into MEDIA_MAP:
    // that would corrupt TS import paths (@/components/home/…).
  }

  // partnership root files
  const partnershipDir = path.join(PUBLIC, "pages", "partnership");
  ensureDir(partnershipDir);
  const partnershipFiles = [
    ["partnership-bottleglass.png", "bottleglass.png"],
    ["partnership-brandbook.png", "brandbook.png"],
    ["partnership-logo.png", "logo.png"],
    ["partnership-pricetag.png", "pricetag.png"],
    ["partnership-Bierdeckel.png", "bierdeckel.png"],
    ["partnership-agreement.png", "agreement.png"],
    ["partnership-arrow.svg", "arrow.svg"],
  ];
  for (const [oldName, newName] of partnershipFiles) {
    const src = path.join(PUBLIC, oldName);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(partnershipDir, newName);
    if (!DRY) {
      fs.renameSync(src, dest);
    }
    record(`/${oldName}`, `/pages/partnership/${newName}`);
  }
}

// ——— Classify and move media/tilda ———

function classifyTilda() {
  const textFiles = readTextFiles();
  /** @type {Map<string, {files: string[], kinds: Set<string>, blogSlugs: Set<string>, pageSections: Set<string>}>} */
  const index = new Map();

  const re = /\/media\/tilda\/[^\s"'`)]+/g;
  for (const file of textFiles) {
    const text = fs.readFileSync(file, "utf8");
    const rel = path.relative(ROOT, file);
    for (const m of text.matchAll(re)) {
      const url = m[0].replace(/[,;.]+$/, "");
      if (!index.has(url)) {
        index.set(url, {
          files: [],
          kinds: new Set(),
          blogSlugs: new Set(),
          pageSections: new Set(),
        });
      }
      const entry = index.get(url);
      entry.files.push(rel);

      if (rel.includes(`${path.sep}blog${path.sep}articles${path.sep}`)) {
        entry.kinds.add("blog");
        const base = path.basename(file, ".json");
        // 2024-06-24-ausweis-ru → prefer ru slug from JSON
        try {
          const json = JSON.parse(text);
          if (json.slug) entry.blogSlugs.add(json.slug);
          else entry.blogSlugs.add(base.replace(/-(ru|en)$/, ""));
        } catch {
          entry.blogSlugs.add(base.replace(/-(ru|en)$/, ""));
        }
      } else if (rel.includes("horeca")) {
        entry.kinds.add("pages");
        entry.pageSections.add("horeca");
      } else if (rel.includes("shop.ts")) {
        entry.kinds.add("pages");
        entry.pageSections.add("shop");
      } else if (rel.includes("contacts")) {
        entry.kinds.add("pages");
        entry.pageSections.add("contacts");
      } else if (rel.includes("vacancies") || rel.includes("expansion") || rel.includes("alias-shells")) {
        entry.kinds.add("pages");
        entry.pageSections.add("blog-misc");
      } else if (rel.includes("about")) {
        entry.kinds.add("pages");
        entry.pageSections.add("about");
      } else {
        entry.kinds.add("pages");
        entry.pageSections.add("misc");
      }
    }
  }

  const buckets = { blog: 0, pages: 0, orphan: 0 };
  const usedDest = new Map(); // destAbs -> count for uniqueness

  function uniqueDest(dir, baseName) {
    let name = baseName;
    let n = 1;
    while (usedDest.has(path.join(dir, name)) || (!DRY && fs.existsSync(path.join(dir, name)) && !usedDest.has(path.join(dir, name)))) {
      // if already claimed in this run, bump
      if (usedDest.has(path.join(dir, name))) {
        const ext = path.extname(baseName);
        const stem = path.basename(baseName, ext);
        name = `${stem}-${n}${ext}`;
        n += 1;
        continue;
      }
      break;
    }
    usedDest.set(path.join(dir, name), 1);
    return name;
  }

  /** Per blog slug image counters */
  const blogCounters = new Map();

  for (const [url, meta] of index.entries()) {
    const relPath = url.replace(/^\//, ""); // media/tilda/...
    const srcAbs = path.join(PUBLIC, relPath);
    if (!fs.existsSync(srcAbs)) {
      console.warn("missing file for", url);
      continue;
    }
    const ext = path.extname(srcAbs).toLowerCase() || ".bin";

    let destUrl;
    let destAbs;

    if (meta.kinds.has("blog") && meta.blogSlugs.size > 0) {
      // Prefer a stable slug: if multiple, use sorted join of first (ru usually longer path shared)
      const slug = [...meta.blogSlugs].sort((a, b) => a.length - b.length)[0];
      const dir = path.join(PUBLIC, "blog", slug);
      ensureDir(dir);
      if (!blogCounters.has(slug)) blogCounters.set(slug, { cover: false, n: 0 });
      const ctr = blogCounters.get(slug);
      let baseName;
      // First image for this slug that is referenced as cover in any article → cover
      // Heuristic: if basename looks like cover-ish or counter is 0 and file used in cover field
      const isCoverRef = meta.files.some((f) => {
        try {
          const j = JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8"));
          return j.cover?.src === url;
        } catch {
          return false;
        }
      });
      if (isCoverRef && !ctr.cover) {
        baseName = `cover${ext}`;
        ctr.cover = true;
      } else {
        ctr.n += 1;
        baseName = `${String(ctr.n).padStart(2, "0")}${ext}`;
      }
      baseName = uniqueDest(dir, baseName);
      destAbs = path.join(dir, baseName);
      destUrl = `/blog/${slug}/${baseName}`;
      buckets.blog += 1;
    } else if (meta.kinds.has("pages")) {
      const section = [...meta.pageSections][0] || "misc";
      const dir = path.join(PUBLIC, "pages", section);
      ensureDir(dir);
      let base = path.basename(srcAbs).toLowerCase().replace(/\s+/g, "-");
      if (base === "image.png" || base === "image.jpg" || /^\d+\.(jpg|png|jpeg)$/i.test(base)) {
        base = `asset-${path.basename(path.dirname(srcAbs)).slice(-8)}${ext}`;
      }
      // sanitize
      base = base.replace(/[^a-z0-9._-]+/gi, "-").replace(/-+/g, "-");
      base = uniqueDest(dir, base);
      destAbs = path.join(dir, base);
      destUrl = `/pages/${section}/${base}`;
      buckets.pages += 1;
    } else {
      const dir = path.join(PUBLIC, "pages", "orphan");
      ensureDir(dir);
      let base = path.basename(srcAbs).toLowerCase().replace(/[^a-z0-9._-]+/gi, "-");
      base = uniqueDest(dir, base);
      destAbs = path.join(dir, base);
      destUrl = `/pages/orphan/${base}`;
      buckets.orphan += 1;
    }

    if (!DRY) {
      ensureDir(path.dirname(destAbs));
      fs.copyFileSync(srcAbs, destAbs);
    }
    record(url, destUrl);
  }

  // Orphan files on disk not referenced
  const tildaRoot = path.join(PUBLIC, "media", "tilda");
  for (const f of walkFiles(tildaRoot)) {
    if (path.basename(f) === "MANIFEST.json") continue;
    const url = `/${path.relative(PUBLIC, f).split(path.sep).join("/")}`;
    if (!MEDIA_MAP[url]) {
      const dir = path.join(PUBLIC, "pages", "orphan");
      ensureDir(dir);
      let base = path.basename(f).toLowerCase().replace(/[^a-z0-9._-]+/gi, "-");
      base = uniqueDest(dir, base);
      const destAbs = path.join(dir, base);
      if (!DRY) {
        fs.copyFileSync(f, destAbs);
      }
      record(url, `/pages/orphan/${base}`);
      buckets.orphan += 1;
    }
  }

  return { indexSize: index.size, buckets };
}

// ——— Rewrite source files ———

function rewriteSources() {
  // Longer keys first for prefix replacements like /about/ → /pages/about/
  const entries = Object.entries(MEDIA_MAP).sort((a, b) => b[0].length - a[0].length);
  let filesChanged = 0;
  let replacements = 0;

  for (const file of readTextFiles()) {
    let text = fs.readFileSync(file, "utf8");
    const before = text;
    for (const [from, to] of entries) {
      if (!from || from === to) continue;
      if (!text.includes(from)) continue;
      const parts = text.split(from);
      if (parts.length > 1) {
        replacements += parts.length - 1;
        text = parts.join(to);
      }
    }
    // Also rewrite catalog covers/logos with spaces that may remain via helpers — handled by product-media rewrite separately
    if (text !== before) {
      if (!DRY) fs.writeFileSync(file, text);
      filesChanged += 1;
      console.log(`✎ ${path.relative(ROOT, file)}`);
    }
  }
  return { filesChanged, replacements };
}

function prefixRewritePages() {
  /**
   * Rewrite public asset URL literals only when they look like files
   * (have an extension). Skip route paths like /tours/check and imports.
   * Also fix about.ts `const A = "/about"`.
   */
  const assetPrefix = (section) =>
    new RegExp(
      `([\`"'])\\/${section}\\/([^\\\`"']+\\.(?:png|jpe?g|gif|webp|svg|mp4|webm|pdf|ico))\\1`,
      "gi",
    );

  const sections = ["about", "home", "agent", "tours"];
  let n = 0;
  for (const file of readTextFiles()) {
    let text = fs.readFileSync(file, "utf8");
    const before = text;
    for (const section of sections) {
      text = text.replace(
        assetPrefix(section),
        (_, q, rest) => `${q}/pages/${section}/${rest}${q}`,
      );
    }
    text = text.replace(
      /const A = "\/about"/g,
      'const A = "/pages/about"',
    );
    text = text.replace(
      /const A = '\/about'/g,
      "const A = '/pages/about'",
    );
    text = text.replace(
      /Local assets under \/public\/partnership-\*\.png/g,
      "Local assets under /public/pages/partnership/",
    );
    // Idempotent repairs from earlier buggy runs
    text = text.split("/pages/pages/").join("/pages/");
    text = text.split("@/components/pages/pages/").join("@/components/");
    text = text.split("@/components/pages/home/").join("@/components/home/");
    text = text.split("@/components/pages/agent/").join("@/components/agent/");
    text = text.split("@/components/pages/about/").join("@/components/about/");
    text = text.split("@/components/pages/tours/").join("@/components/tours/");
    text = text.split("@/components/pages/blog/").join("@/components/blog/");
    // Fix `${A}/pages/tours/...` when A already is /pages/about
    text = text.replace(
      /(\$\{A\})\/pages\/(tours|agent)\//g,
      "$1/$2/",
    );
    if (text !== before) {
      if (!DRY) fs.writeFileSync(file, text);
      n += 1;
      console.log(`✎ prefix ${path.relative(ROOT, file)}`);
    }
  }
  return n;
}

function cleanup() {
  if (DRY) return;
  const kill = [
    path.join(PUBLIC, "media"),
    path.join(PUBLIC, "catalog"),
  ];
  // old page dirs if empty leftovers
  for (const d of ["about", "home", "agent", "tours"]) {
    kill.push(path.join(PUBLIC, d));
  }
  for (const d of kill) {
    if (fs.existsSync(d)) {
      fs.rmSync(d, { recursive: true, force: true });
      console.log(`rm ${path.relative(PUBLIC, d)}`);
    }
  }
}

// ——— main ———

console.log(DRY ? "=== DRY RUN ===" : "=== APPLY ===");

console.log("\n[1] Assemble products/");
const prodReport = assembleProducts();
console.log(`  copied assets: ${prodReport.ok}`);
if (prodReport.missing.length) {
  console.log("  missing:", prodReport.missing.slice(0, 20));
}

console.log("\n[2] Relocate page trees + partnership");
relocatePages();

console.log("\n[3] Classify media/tilda → blog/ + pages/");
const tildaReport = classifyTilda();
console.log("  index", tildaReport.indexSize, "buckets", tildaReport.buckets);

console.log("\n[4] Rewrite source references (exact URLs)");
const rw = rewriteSources();
console.log(`  files ${rw.filesChanged}, replacements ${rw.replacements}`);

console.log("\n[5] Prefix rewrite for moved page trees");
const pref = prefixRewritePages();
console.log(`  files ${pref}`);

console.log("\n[6] Cleanup old trees");
cleanup();

const mapPath = path.join(PUBLIC, "MEDIA_MAP.json");
if (!DRY) {
  fs.writeFileSync(
    mapPath,
    `${JSON.stringify(
      {
        migratedAt: new Date().toISOString(),
        count: Object.keys(MEDIA_MAP).length,
        map: MEDIA_MAP,
      },
      null,
      2,
    )}\n`,
  );
}
console.log(`\nMEDIA_MAP entries: ${Object.keys(MEDIA_MAP).length}`);
console.log("Done.");
