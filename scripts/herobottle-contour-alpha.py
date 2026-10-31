#!/usr/bin/env python3
"""
Cut black matte by contour (flood-fill from borders), not by global threshold.

Preserves dark glass/label pixels inside the bottle. Reads PNG frames, writes
RGBA PNG with alpha=0 only for background connected to the frame edge.

Usage:
  python scripts/herobottle-contour-alpha.py <frames_dir> [--threshold 28] [--soft 1]
"""

from __future__ import annotations

import argparse
import sys
from collections import deque
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


def flood_background_mask(rgb: np.ndarray, threshold: int) -> np.ndarray:
    """True = background (connected to border and near-black)."""
    h, w, _ = rgb.shape
    candidate = rgb.max(axis=2) <= threshold
    bg = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    def try_seed(y: int, x: int) -> None:
        if candidate[y, x] and not bg[y, x]:
            bg[y, x] = True
            q.append((y, x))

    for x in range(w):
        try_seed(0, x)
        try_seed(h - 1, x)
    for y in range(h):
        try_seed(y, 0)
        try_seed(y, w - 1)

    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and candidate[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True
                q.append((ny, nx))
    return bg


def soft_edge(bg: np.ndarray, soft: int) -> np.ndarray:
    if soft <= 0:
        return np.where(bg, 0, 255).astype(np.uint8)

    mask_img = Image.fromarray((~bg).astype(np.uint8) * 255)
    eroded = mask_img
    for _ in range(soft):
        eroded = eroded.filter(ImageFilter.MinFilter(3))
    hard = np.asarray(eroded)
    soft_mask = np.asarray(mask_img)
    alpha = soft_mask.astype(np.uint8)
    ring = (soft_mask > 0) & (hard == 0)
    alpha[ring] = 128
    alpha[hard > 0] = 255
    return alpha


def close_foreground(bg: np.ndarray, radius: int) -> np.ndarray:
    """Seal thin matte leaks into dark glass (morphological close on FG)."""
    if radius <= 0:
        return bg
    fg = Image.fromarray((~bg).astype(np.uint8) * 255)
    for _ in range(radius):
        fg = fg.filter(ImageFilter.MaxFilter(3))
    for _ in range(radius):
        fg = fg.filter(ImageFilter.MinFilter(3))
    return np.asarray(fg) == 0


def seal_column_gaps(bg: np.ndarray) -> np.ndarray:
    """Fill transparent gaps between first/last FG in each column.

    Preserves the outer silhouette (no left/right slab fill that flattens the
    punt into an angular block). Only restores interior leaks in a column.
    """
    fg = ~bg
    h, w = fg.shape
    out = fg.copy()
    for x in range(w):
        col = fg[:, x]
        ys = np.flatnonzero(col)
        if ys.size < 2:
            continue
        out[ys[0] : ys[-1] + 1, x] = True
    return ~out


def process_one(args: tuple[str, str, int, int, int]) -> str:
    src_s, dst_s, threshold, soft, close = args
    src = Path(src_s)
    dst = Path(dst_s)
    im = Image.open(src).convert("RGB")
    rgb = np.asarray(im, dtype=np.uint8)
    bg = flood_background_mask(rgb, threshold)
    bg = close_foreground(bg, close)
    bg = seal_column_gaps(bg)
    alpha = soft_edge(bg, soft)
    rgba = np.dstack([rgb, alpha])
    Image.fromarray(rgba).save(dst, compress_level=1)
    return src.name


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("frames_dir", type=Path)
    ap.add_argument("--out-dir", type=Path, default=None)
    ap.add_argument("--threshold", type=int, default=28)
    ap.add_argument("--soft", type=int, default=1)
    ap.add_argument(
        "--close",
        type=int,
        default=5,
        help="Morphological close radius on FG to seal punt leaks",
    )
    ap.add_argument("--workers", type=int, default=8)
    args = ap.parse_args()

    src = args.frames_dir
    dst = args.out_dir or (src.parent / "frames-alpha")
    dst.mkdir(parents=True, exist_ok=True)

    frames = sorted(src.glob("frame-*.png"))
    if not frames:
        print(f"No frame-*.png in {src}", file=sys.stderr)
        return 1

    jobs = [
        (str(f), str(dst / f.name), args.threshold, args.soft, args.close)
        for f in frames
    ]
    done = 0
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(process_one, job) for job in jobs]
        for fut in as_completed(futures):
            fut.result()
            done += 1
            if done % 100 == 0 or done == len(jobs):
                print(f"{done}/{len(jobs)}", flush=True)

    sample = Image.open(dst / frames[0].name)
    a = np.asarray(sample)[:, :, 3]
    h, w = a.shape
    # Corner should be transparent; center band should keep opaque pixels
    corners = [a[0, 0], a[0, w - 1], a[h - 1, 0], a[h - 1, w - 1]]
    mid = a[h // 2, w // 2]
    print(
        f"done → {dst} | corners_alpha={corners} mid_alpha={mid} "
        f"transparent={int((a < 16).sum())} opaque={int((a > 240).sum())}",
        flush=True,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
