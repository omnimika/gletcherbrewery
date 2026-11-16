import jpeg from "jpeg-js";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import {
  parseFiscalQrPayload,
  receiptFingerprint,
} from "./fingerprint";

export type DecodedFiscalQr = {
  payload: string;
  fn: string;
  fd: string;
  fp: string;
  operation: string;
  fingerprint: string;
  sum?: string;
  time?: string;
};

type RgbaImage = { data: Uint8ClampedArray; width: number; height: number };

function decodeToRgba(buffer: Buffer, contentType?: string): RgbaImage | null {
  const ct = (contentType || "").toLowerCase();
  const isPng =
    ct.includes("png") || buffer[0] === 0x89;
  const isJpeg =
    ct.includes("jpeg") ||
    ct.includes("jpg") ||
    (buffer[0] === 0xff && buffer[1] === 0xd8);

  try {
    if (isPng) {
      const png = PNG.sync.read(buffer);
      return {
        data: new Uint8ClampedArray(png.data.buffer, png.data.byteOffset, png.data.byteLength),
        width: png.width,
        height: png.height,
      };
    }
    if (isJpeg) {
      const decoded = jpeg.decode(buffer, { useTArray: true, formatAsRGBA: true });
      if (!decoded?.data) return null;
      return {
        data: new Uint8ClampedArray(
          decoded.data.buffer,
          decoded.data.byteOffset,
          decoded.data.byteLength,
        ),
        width: decoded.width,
        height: decoded.height,
      };
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Try to read a fiscal receipt QR from an image buffer (PNG/JPEG).
 * Returns null if no QR or payload is not fiscal-shaped.
 */
export function decodeFiscalQrFromImage(
  buffer: Buffer,
  contentType?: string,
): DecodedFiscalQr | null {
  const img = decodeToRgba(buffer, contentType);
  if (!img || img.width < 16 || img.height < 16) return null;

  const code = jsQR(img.data, img.width, img.height, {
    inversionAttempts: "attemptBoth",
  });
  if (!code?.data?.trim()) return null;

  const payload = code.data.trim();
  const parsed = parseFiscalQrPayload(payload);
  if (!parsed.fn || !parsed.fd || !parsed.fp) return null;

  const operation = parsed.operation ?? "1";
  return {
    payload,
    fn: parsed.fn,
    fd: parsed.fd,
    fp: parsed.fp,
    operation,
    fingerprint: receiptFingerprint({
      fn: parsed.fn,
      fd: parsed.fd,
      fp: parsed.fp,
      operation,
    }),
    sum: parsed.sum,
    time: parsed.time,
  };
}
