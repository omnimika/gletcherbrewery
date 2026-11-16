/**
 * Load Airtable UI CSV exports (tmp/Airtable) into LoyaltyTableFile[].
 * Links Покупатель/Агент are emails in these dumps — remapped to user `id`.
 * Does not log PII.
 */
import fs from "node:fs";
import path from "node:path";
import { normalizeMemberEmail } from "@/server/loyalty/normalize-alias";
import {
  AIRTABLE_LOYALTY_TABLES,
  LOYALTY_IMPORT_MAPPING_VERSION,
} from "./tables";
import type { LoyaltyImportManifest, LoyaltyTableFile } from "./types";

/** Minimal RFC4180 CSV parse (quoted fields, multiline). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let i = 0;
  let inQuotes = false;
  // strip BOM
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  while (i < text.length) {
    const c = text[i]!;
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
      i += 1;
      continue;
    }
    field += c;
    i += 1;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function recordsFromCsv(text: string): Record<string, string>[] {
  const grid = parseCsv(text);
  if (grid.length < 2) return [];
  const headers = grid[0]!;
  return grid.slice(1).map((cells) => {
    const obj: Record<string, string> = {};
    for (let h = 0; h < headers.length; h++) {
      obj[headers[h]!] = cells[h] ?? "";
    }
    return obj;
  });
}

export const AIRTABLE_CSV_FILES = {
  users: "Пользователи-Главная.csv",
  /** Full checks dump (xls export). `Чеки-Все.csv` was a filtered view (~62 rows). */
  checks: "Чеки-xls.csv",
  agents: "Агенты-Все.csv",
  orders: "Заказы-Все.csv",
  purchases: "Покупки-Все.csv",
  products: "Товары-Главная.csv",
  promos: "Акции-Главная.csv",
} as const;

export type AirtableCsvSourceTargets = {
  members: number;
  uniqueEmails: number;
  duplicateEmailRows: number;
  sumAvailable: number;
  sumLifetime: number;
  sumCheckEarnRollup: number;
  sumShopEarnRollup: number;
  sumAgentEarnRollup: number;
  sumSpendRollup: number;
  checksInFile: number;
  sumCheckEarnInFile: number;
  checkEarnGap: number;
  agents: number;
  orders: number;
  /** Per-email targets for reconcile (local only; do not print). */
  byEmail: Map<string, { available: number; lifetime: number }>;
};

export type LoadAirtableCsvResult = {
  manifest: LoyaltyImportManifest;
  files: LoyaltyTableFile[];
  sourceTargets: AirtableCsvSourceTargets;
  warnings: string[];
};

function readCsvRecords(abs: string): Record<string, string>[] {
  return recordsFromCsv(fs.readFileSync(abs, "utf8"));
}

function cell(row: Record<string, string>, key: string): string {
  return (row[key] ?? "").trim();
}

function parseNumber(raw: string): number | null {
  // Airtable xls/csv money often looks like `₽3000.00` or `3 000,00`.
  const s = raw
    .trim()
    .replace(/[₽$€£\u00a0]/g, "")
    .replace(/\s/g, "")
    .replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Airtable CSV dates: `YYYY-MM-DD HH:mm` or `D.M.YYYY HH:mm`. */
export function parseAirtableCsvDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const iso = s.includes("T") ? s : s.replace(" ", "T");
    const d = new Date(iso.length === 16 ? `${iso}:00` : iso);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  const m = s.match(
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/,
  );
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const hh = Number(m[4] ?? 0);
  const mm = Number(m[5] ?? 0);
  const d = new Date(Date.UTC(year, month - 1, day, hh, mm));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function loadAirtableCsvDir(
  dir: string,
  opts: {
    cutoffAt: Date;
    sourceLabel?: string;
    exportedAt?: string;
  },
): LoadAirtableCsvResult {
  const warnings: string[] = [];
  const abs = path.resolve(dir);

  const usersPath = path.join(abs, AIRTABLE_CSV_FILES.users);
  const checksPath = path.join(abs, AIRTABLE_CSV_FILES.checks);
  const agentsPath = path.join(abs, AIRTABLE_CSV_FILES.agents);
  const ordersPath = path.join(abs, AIRTABLE_CSV_FILES.orders);
  const purchasesPath = path.join(abs, AIRTABLE_CSV_FILES.purchases);
  const productsPath = path.join(abs, AIRTABLE_CSV_FILES.products);
  const promosPath = path.join(abs, AIRTABLE_CSV_FILES.promos);

  for (const p of [
    usersPath,
    checksPath,
    agentsPath,
    ordersPath,
    purchasesPath,
    productsPath,
    promosPath,
  ]) {
    if (!fs.existsSync(p)) {
      throw new Error(`missing CSV: ${p}`);
    }
  }

  const userRows = readCsvRecords(usersPath);
  const checkRows = readCsvRecords(checksPath);
  const agentRows = readCsvRecords(agentsPath);
  const orderRows = readCsvRecords(ordersPath);
  const purchaseRows = readCsvRecords(purchasesPath);
  const productRows = readCsvRecords(productsPath);
  const promoRows = readCsvRecords(promosPath);

  const emailToUserId = new Map<string, string>();
  const byEmail = new Map<string, { available: number; lifetime: number }>();
  let duplicateEmailRows = 0;
  let sumAvailable = 0;
  let sumLifetime = 0;
  let sumCheckEarnRollup = 0;
  let sumShopEarnRollup = 0;
  let sumAgentEarnRollup = 0;
  let sumSpendRollup = 0;

  const userRecords = userRows.map((row) => {
    const email = normalizeMemberEmail(cell(row, "Email"));
    const id = cell(row, "id") || `email:${email}`;
    if (emailToUserId.has(email)) {
      duplicateEmailRows += 1;
    } else {
      emailToUserId.set(email, id);
    }
    const available = parseNumber(cell(row, "Биркоины доступно")) ?? 0;
    const lifetime = parseNumber(cell(row, "Биркоины всего накоплено")) ?? 0;
    sumAvailable += available;
    sumLifetime += lifetime;
    sumCheckEarnRollup +=
      parseNumber(cell(row, "Биркоины начислены за чеки")) ?? 0;
    sumShopEarnRollup += parseNumber(cell(row, "Биркоины начислены")) ?? 0;
    sumAgentEarnRollup +=
      parseNumber(cell(row, "Биркоины начислены агентские")) ?? 0;
    sumSpendRollup += parseNumber(cell(row, "Биркоины списаны")) ?? 0;
    if (!byEmail.has(email)) {
      byEmail.set(email, { available, lifetime });
    }
    return {
      id,
      fields: {
        email,
        displayName: cell(row, "Имя") || null,
        phone: cell(row, "phone") || null,
        city: cell(row, "city") || null,
        createdAt: parseAirtableCsvDate(cell(row, "Created")),
        availableRollup: available,
        lifetimeRollup: lifetime,
      },
    };
  });

  let sumCheckEarnInFile = 0;
  const checkRecords = checkRows.map((row) => {
    const orderId = cell(row, "order_id");
    const buyerEmail = normalizeMemberEmail(cell(row, "Покупатель"));
    const buyerId = emailToUserId.get(buyerEmail);
    const earn = parseNumber(cell(row, "Биркоины начислить2"));
    if (earn != null) sumCheckEarnInFile += earn;
    return {
      id: orderId || `check:${buyerEmail}:${cell(row, "Дата создания")}`,
      fields: {
        buyer: buyerId ? [buyerId] : [],
        buyerEmail,
        paidFlag: cell(row, "Оплачено"),
        earnAmount: earn,
        gletcherSumRub: parseNumber(cell(row, "Сумма")),
        city: cell(row, "city") || null,
        createdAt: parseAirtableCsvDate(cell(row, "Дата создания")),
        venueName: cell(row, "Название") || null,
        buyplace: cell(row, "buyplace") || null,
      },
    };
  });

  const agentRecords = agentRows.map((row) => {
    const orderId = cell(row, "order_id");
    const agentEmail = normalizeMemberEmail(cell(row, "Агент"));
    const memberId = emailToUserId.get(agentEmail);
    return {
      id: orderId || `agent:${agentEmail}:${cell(row, "Дата создания")}`,
      fields: {
        member: memberId ? [memberId] : [],
        status: cell(row, "Статус заявки"),
        phone: cell(row, "Телефон агента") || cell(row, "phone"),
        city: cell(row, "city"),
        venueName: cell(row, "Название заведения"),
        venueType: cell(row, "Тип заведения") || "bar",
        venueAddress: cell(row, "Адрес заведения"),
        venueBoss: cell(row, "Босс заведения") || null,
        comment: cell(row, "Комментарий") || null,
        earnAmount: parseNumber(cell(row, "Биркоины начислить агентские")),
        createdAt: parseAirtableCsvDate(cell(row, "Дата создания")),
        orderId,
      },
    };
  });

  const orderRecords = orderRows.map((row) => {
    const orderId = cell(row, "order_id");
    const buyerEmail = normalizeMemberEmail(cell(row, "Покупатель"));
    const buyerId = emailToUserId.get(buyerEmail);
    // Prefer number field; fall back to formula field — never sum both.
    const earn2 = parseNumber(cell(row, "Биркоины начислить2"));
    const earnFormula = parseNumber(cell(row, "Биркоины начислить"));
    const earnAmount = earn2 ?? earnFormula;
    return {
      id: orderId || `order:${buyerEmail}`,
      fields: {
        buyer: buyerId ? [buyerId] : [],
        earnAmount,
        spendAmount: parseNumber(cell(row, "Биркоины списать")),
        paidFlag: cell(row, "Оплачено"),
        createdAt: parseAirtableCsvDate(cell(row, "Дата создания")),
      },
    };
  });

  const purchaseRecords = purchaseRows.map((row, i) => ({
    id: cell(row, "order_id") || `purchase:${i}`,
    fields: {
      sku: cell(row, "SKU") || null,
      title: cell(row, "Название") || null,
      qty: parseNumber(cell(row, "Количество")),
      orderRef: cell(row, "Заказ") || null,
    },
  }));

  const productRecords = productRows.map((row, i) => ({
    id: cell(row, "Артикул") || `product:${i}`,
    fields: {
      sku: cell(row, "Артикул"),
      title: cell(row, "Название"),
      price: parseNumber(cell(row, "Стоимость")),
    },
  }));

  const promoRecords = promoRows.map((row, i) => ({
    id: cell(row, "id") || cell(row, "Спецпредложение") || `promo:${i}`,
    fields: {
      title: cell(row, "Заголовок") || cell(row, "Спецпредложение"),
      active: true,
    },
  }));

  const checkEarnGap = sumCheckEarnRollup - sumCheckEarnInFile;
  const orphanBuyers = checkRecords.filter(
    (r) => !Array.isArray(r.fields.buyer) || r.fields.buyer.length === 0,
  ).length;
  if (checkRows.length < 500) {
    warnings.push(
      `checks_row_count_low: ${checkRows.length} (expected ~5000+) — wrong/filtered file?`,
    );
  }
  if (Math.abs(checkEarnGap) > 1) {
    // Orphan checks (no buyer) inflate file earn vs user rollups — expected class.
    warnings.push(
      `check_earn_vs_user_rollup: file=${sumCheckEarnInFile} rollup=${sumCheckEarnRollup} gap=${checkEarnGap} orphan_buyers=${orphanBuyers}`,
    );
  }
  if (orphanBuyers > 0) {
    warnings.push(`orphan_checks_without_buyer: ${orphanBuyers}`);
  }

  const files: LoyaltyTableFile[] = [
    {
      tableId: AIRTABLE_LOYALTY_TABLES.users,
      fileName: AIRTABLE_CSV_FILES.users,
      records: userRecords,
    },
    {
      tableId: AIRTABLE_LOYALTY_TABLES.checks,
      fileName: AIRTABLE_CSV_FILES.checks,
      records: checkRecords,
    },
    {
      tableId: AIRTABLE_LOYALTY_TABLES.agents,
      fileName: AIRTABLE_CSV_FILES.agents,
      records: agentRecords,
    },
    {
      tableId: AIRTABLE_LOYALTY_TABLES.orders,
      fileName: AIRTABLE_CSV_FILES.orders,
      records: orderRecords,
    },
    {
      tableId: AIRTABLE_LOYALTY_TABLES.purchases,
      fileName: AIRTABLE_CSV_FILES.purchases,
      records: purchaseRecords,
    },
    {
      tableId: AIRTABLE_LOYALTY_TABLES.products,
      fileName: AIRTABLE_CSV_FILES.products,
      records: productRecords,
    },
    {
      tableId: AIRTABLE_LOYALTY_TABLES.promos,
      fileName: AIRTABLE_CSV_FILES.promos,
      records: promoRecords,
    },
  ];

  const cutoffAt = opts.cutoffAt.toISOString();
  const sourceLabel =
    opts.sourceLabel ?? `airtable-csv-${cutoffAt.slice(0, 10)}`;

  const manifest: LoyaltyImportManifest = {
    sourceLabel,
    source: {
      system: "airtable",
      baseId: "appq63sJgcuLGSUPC",
      schemaRevision: "csv-ui-export-2026-11-16",
      owner: "gletcher-owner",
      exportedAt: opts.exportedAt ?? "2026-11-16T20:58:00.000Z",
    },
    files: files.map((f) => ({
      tableId: f.tableId,
      fileName: f.fileName,
      rowCount: f.records.length,
      encoding: "utf-8",
    })),
    snapshotBoundary: `csv-dir:${path.basename(abs)};cutoff=${cutoffAt}`,
    policy: {
      version: "r11-2026-11-16",
      mappingVersion: LOYALTY_IMPORT_MAPPING_VERSION,
      legacyEligibility: {
        mode: "cutoff",
        cutoffAt,
        reason: "owner: дата-срез от текущей даты (eligible if sourceAt ≤ cutoff)",
      },
    },
    dataHandling: {
      pii: "protected",
      notes: "tmp/Airtable CSV; gitignored; do not commit or paste PII",
    },
    rehearsal: {
      targetDb: "local-embedded",
      runId: sourceLabel,
    },
  };

  return {
    manifest,
    files,
    sourceTargets: {
      members: userRecords.length,
      uniqueEmails: emailToUserId.size,
      duplicateEmailRows,
      sumAvailable,
      sumLifetime,
      sumCheckEarnRollup,
      sumShopEarnRollup,
      sumAgentEarnRollup,
      sumSpendRollup,
      checksInFile: checkRecords.length,
      sumCheckEarnInFile,
      checkEarnGap,
      agents: agentRecords.length,
      orders: orderRecords.length,
      byEmail,
    },
    warnings,
  };
}
