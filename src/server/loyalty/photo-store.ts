import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const ROOT = path.join(process.cwd(), ".tmp", "loyalty-receipts");

/**
 * Storage key for receipt photos.
 * Local non-prod: filename under `.tmp/loyalty-receipts`.
 * Later Yandex Object Storage: same key shape → `s3://bucket/{objectKey}`
 * without changing DB column `photo_object_key`.
 */
export function isSafePhotoObjectKey(objectKey: string): boolean {
  return /^[a-f0-9-]{36}\.(jpg|jpeg|png|webp)$/i.test(objectKey.trim());
}

export function localPhotoAbsolutePath(objectKey: string): string | null {
  if (!isSafePhotoObjectKey(objectKey)) return null;
  const abs = path.join(ROOT, objectKey.trim());
  if (!abs.startsWith(ROOT + path.sep)) return null;
  return abs;
}

export function contentTypeForPhotoKey(objectKey: string): string {
  const ext = objectKey.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

/** Non-prod local object store for receipt photos (gitignored .tmp). */
export async function storeReceiptPhotoLocal(input: {
  bytes: Buffer;
  contentType: string;
  originalName?: string;
}): Promise<{ objectKey: string }> {
  await mkdir(ROOT, { recursive: true });
  const ext =
    input.contentType.includes("png")
      ? "png"
      : input.contentType.includes("webp")
        ? "webp"
        : "jpg";
  const id = randomUUID();
  const objectKey = `${id}.${ext}`;
  await writeFile(path.join(ROOT, objectKey), input.bytes);
  return { objectKey };
}

/** Read bytes for staff preview (local backend). S3: swap to GetObject. */
export async function readReceiptPhotoLocal(
  objectKey: string,
): Promise<{ bytes: Buffer; contentType: string } | null> {
  const abs = localPhotoAbsolutePath(objectKey);
  if (!abs) return null;
  try {
    const bytes = await readFile(abs);
    return { bytes, contentType: contentTypeForPhotoKey(objectKey) };
  } catch {
    return null;
  }
}
