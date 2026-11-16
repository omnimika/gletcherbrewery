import { spawn } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { OcrProvider } from "./ocr";
import { stubOcrProvider } from "./ocr";

/**
 * Optional self-host OCR via system `tesseract` CLI (rus+eng).
 * Enable: LOYALTY_OCR=tesseract-cli and install tesseract on the host.
 */
export const tesseractCliOcrProvider: OcrProvider = {
  id: "tesseract-cli",
  async extractText(image: Buffer, contentType?: string) {
    const ext =
      contentType?.includes("png")
        ? "png"
        : contentType?.includes("webp")
          ? "webp"
          : "jpg";
    const dir = await mkdtemp(path.join(tmpdir(), "gletcher-ocr-"));
    const file = path.join(dir, `receipt.${ext}`);
    try {
      await writeFile(file, image);
      const text = await runTesseract(file);
      const trimmed = text?.trim() || null;
      return trimmed && trimmed.length > 0 ? trimmed : null;
    } catch {
      return null;
    } finally {
      await rm(dir, { recursive: true, force: true }).catch(() => {});
    }
  },
};

function runTesseract(imagePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "tesseract",
      [imagePath, "stdout", "-l", "rus+eng", "--psm", "6"],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    let out = "";
    let err = "";
    child.stdout.on("data", (c: Buffer) => {
      out += c.toString("utf8");
    });
    child.stderr.on("data", (c: Buffer) => {
      err += c.toString("utf8");
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(out);
      else reject(new Error(err || `tesseract exit ${code}`));
    });
  });
}

export function getOcrProvider(): OcrProvider {
  const mode = (process.env.LOYALTY_OCR || "stub").trim().toLowerCase();
  if (mode === "tesseract-cli" || mode === "tesseract") {
    return tesseractCliOcrProvider;
  }
  return stubOcrProvider;
}
