#!/usr/bin/env python3
"""Rename public/blog/* dirs to match article stems; update JSON + MEDIA_MAP."""

from __future__ import annotations

import json
import re
import shutil
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTICLES = ROOT / "src/content/blog/articles"
MEDIA = ROOT / "public/blog"
MEDIA_MAP = ROOT / "public/MEDIA_MAP.json"

path_re = re.compile(r'"/blog/([^/"]+)/([^"]*)"')
blog_path_re = re.compile(r"^/blog/([^/]+)/(.*)$")


def main() -> None:
    art_dirs: dict[str, set[str]] = {}
    old_to_targets: dict[str, set[str]] = defaultdict(set)

    for f in sorted(ARTICLES.glob("*.json")):
        stem = f.stem
        text = f.read_text(encoding="utf-8")
        dirs = {m.group(1) for m in path_re.finditer(text)}
        art_dirs[stem] = dirs
        for d in dirs:
            old_to_targets[d].add(stem)

    missing = [d for d in old_to_targets if not (MEDIA / d).is_dir()]
    if missing:
        raise SystemExit(f"Missing media dirs: {missing}")

    target_files: dict[str, dict[str, Path]] = defaultdict(dict)
    warnings: list[str] = []

    for stem, dirs in art_dirs.items():
        ordered = sorted(
            dirs, key=lambda d: (0 if old_to_targets[d] == {stem} else 1, d)
        )
        for d in ordered:
            src_dir = MEDIA / d
            for src in src_dir.iterdir():
                if not src.is_file() or src.name.startswith("."):
                    continue
                if src.name in target_files[stem]:
                    prev = target_files[stem][src.name]
                    if (
                        prev.resolve() != src.resolve()
                        and prev.stat().st_size != src.stat().st_size
                    ):
                        warnings.append(
                            f"COLLISION {stem}/{src.name}: keep {prev.parent.name}, skip {d}"
                        )
                    continue
                target_files[stem][src.name] = src

    print(
        f"Articles: {len(art_dirs)}, old dirs: {len(old_to_targets)}, "
        f"targets: {len(target_files)}"
    )
    for w in warnings:
        print(" ", w)

    stage = MEDIA / "_rename_stage"
    if stage.exists():
        shutil.rmtree(stage)
    stage.mkdir()

    for stem, files in sorted(target_files.items()):
        dest = stage / stem
        dest.mkdir()
        for name, src in files.items():
            shutil.copy2(src, dest / name)

    existing = [p for p in MEDIA.iterdir() if p.is_dir() and p.name != "_rename_stage"]
    for p in existing:
        shutil.rmtree(p)

    for stem_dir in stage.iterdir():
        shutil.move(str(stem_dir), str(MEDIA / stem_dir.name))
    stage.rmdir()

    replacements = 0
    for f in sorted(ARTICLES.glob("*.json")):
        stem = f.stem
        text = f.read_text(encoding="utf-8")

        def repl(m: re.Match[str], *, _stem: str = stem) -> str:
            nonlocal replacements
            old_dir, rest = m.group(1), m.group(2)
            if old_dir == _stem:
                return m.group(0)
            replacements += 1
            return f'"/blog/{_stem}/{rest}"'

        new_text = path_re.sub(repl, text)
        if new_text != text:
            f.write_text(new_text, encoding="utf-8")

    print(f"Updated path refs in articles: {replacements}")

    if MEDIA_MAP.exists():
        data = json.loads(MEDIA_MAP.read_text(encoding="utf-8"))
        mapping: dict[str, str]
        if isinstance(data, dict) and all(isinstance(v, str) for v in data.values()):
            mapping = data
            write_flat = True
        else:
            write_flat = False
            mapping = {}
            for _k, v in data.items():
                if isinstance(v, dict) and any(
                    isinstance(x, str) and x.startswith("/blog/") for x in v.values()
                ):
                    mapping = v
                    break
            if not mapping:
                print("MEDIA_MAP structure unknown, skipping")

        updated = 0
        for k, v in list(mapping.items()):
            if not isinstance(v, str) or not v.startswith("/blog/"):
                continue
            m = blog_path_re.match(v)
            if not m:
                continue
            old_dir, rest = m.group(1), m.group(2)
            targets = old_to_targets.get(old_dir)
            if not targets:
                continue
            hits = [t for t in sorted(targets) if (MEDIA / t / rest).exists()]
            chosen = hits[0] if hits else sorted(targets)[0]
            new_v = f"/blog/{chosen}/{rest}"
            if new_v != v:
                mapping[k] = new_v
                updated += 1

        if write_flat:
            MEDIA_MAP.write_text(
                json.dumps(mapping, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
        else:
            MEDIA_MAP.write_text(
                json.dumps(data, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
        print(f"MEDIA_MAP entries updated: {updated}")

    new_dirs = sorted(p.name for p in MEDIA.iterdir() if p.is_dir())
    print(f"New media dir count: {len(new_dirs)}")
    print("Sample:", new_dirs[:5], "...", new_dirs[-3:])

    broken: list[str] = []
    for f in ARTICLES.glob("*.json"):
        for m in path_re.finditer(f.read_text(encoding="utf-8")):
            p = MEDIA / m.group(1) / m.group(2)
            if not p.exists():
                broken.append(str(p))
    print(f"Broken refs: {len(broken)}")
    for b in broken[:20]:
        print(" ", b)


if __name__ == "__main__":
    main()
