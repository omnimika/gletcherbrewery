/**
 * Anti-fraud key from fiscal QR fields.
 * QR typically: t=…&s=…&fn=…&i=…&fp=…&n=…
 */
export function receiptFingerprint(input: {
  fn: string;
  fd: string;
  fp: string;
  operation?: string;
}): string {
  const fn = input.fn.trim();
  const fd = input.fd.trim();
  const fp = input.fp.trim();
  const op = (input.operation ?? "1").trim() || "1";
  if (!fn || !fd || !fp) {
    throw new Error("fn, fd, fp are required for receipt fingerprint");
  }
  return `${fn}|${fd}|${fp}|${op}`;
}

/** Parse common fiscal QR query string into parts (best-effort). */
export function parseFiscalQrPayload(payload: string): {
  fn?: string;
  fd?: string;
  fp?: string;
  operation?: string;
  sum?: string;
  time?: string;
} {
  const raw = payload.trim();
  const q = raw.includes("?") ? raw.slice(raw.indexOf("?") + 1) : raw;
  const map = new URLSearchParams(q);
  return {
    time: map.get("t") ?? undefined,
    sum: map.get("s") ?? undefined,
    fn: map.get("fn") ?? undefined,
    fd: map.get("i") ?? undefined,
    fp: map.get("fp") ?? undefined,
    operation: map.get("n") ?? undefined,
  };
}
