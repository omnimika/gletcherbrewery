import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const ROOT = path.join(process.cwd(), ".tmp", "loyalty-receipts");

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
