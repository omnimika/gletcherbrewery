/**
 * Owner Confirmed 10.11: all existing Airtable checks with Оплачено=НЕТ
 * were manually reviewed → import as verified / treat as ДА.
 */
export function legacyCheckImportStatus(
  airtablePaidFlag: string | null | undefined,
): {
  receiptStatus: "verified";
  legacyPaidFlag: string;
  note: string;
} {
  const flag = (airtablePaidFlag ?? "НЕТ").trim().toUpperCase();
  return {
    receiptStatus: "verified",
    legacyPaidFlag: flag === "ДА" ? "ДА" : flag || "НЕТ",
    note:
      flag === "ДА"
        ? "legacy already ДА"
        : "legacy НЕТ upgraded to verified (owner manual review)",
  };
}
