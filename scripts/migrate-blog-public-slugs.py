#!/usr/bin/env python3
"""
Align blog media dirs + article.slug with public URL slug:
  /blog/YYYY-MM-DD-{descriptive-slug-without-tilda-hash}

Also rewrites localSlug in src/content/blog.ts and home/about hard links.
"""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTICLES = ROOT / "src/content/blog/articles"
MEDIA = ROOT / "public/blog"
MEDIA_MAP = ROOT / "public/MEDIA_MAP.json"
BLOG_TS = ROOT / "src/content/blog.ts"
HOME_TS = ROOT / "src/content/home.ts"
ABOUT_TS = ROOT / "src/content/about.ts"

path_re = re.compile(r'"/blog/([^/"]+)/([^"]*)"')
blog_href_re = re.compile(
    r'(/blog-all/tpost/|/en/blog-all/tpost/|/blog/)([a-z0-9][a-z0-9-]*)'
)


def strip_tilda_hash(slug: str) -> str:
    """Strip Tilda hash prefix (`913cadd4f1-…`) when present; keep bare slugs."""
    m = re.match(r"^([a-z0-9]{9,12})-(.+)$", slug, re.I)
    if not m:
        return slug
    head, rest = m.group(1), m.group(2)
    if not re.search(r"\d", head):
        return slug
    return rest


def public_slug(published_at: str, old_slug: str) -> str:
    return f"{published_at}-{strip_tilda_hash(old_slug)}"


def main() -> None:
    # article file stem currently = previous rename target (date-id-locale)
    # Map old public slug (in JSON) -> new public slug; media dir currently = stem
    old_to_new: dict[str, str] = {}
    stem_to_new: dict[str, str] = {}
    media_moves: list[tuple[Path, Path]] = []

    for f in sorted(ARTICLES.glob("*.json")):
        data = json.loads(f.read_text(encoding="utf-8"))
        date = f.stem[:10]
        assert re.match(r"^\d{4}-\d{2}-\d{2}$", date), f.stem
        old_slug = data["slug"]
        new_slug = public_slug(date, old_slug)
        if new_slug in stem_to_new.values() and stem_to_new.get(f.stem) != new_slug:
            # collision across different stems
            raise SystemExit(f"Slug collision: {new_slug}")
        old_to_new[old_slug] = new_slug
        stem_to_new[f.stem] = new_slug

        # Update JSON body
        data["slug"] = new_slug
        text = json.dumps(data, ensure_ascii=False, indent=2)
        # also rewrite any /blog/{oldMedia}/ paths to /blog/{newSlug}/
        def repl_path(m: re.Match[str], *, ns: str = new_slug) -> str:
            return f'"/blog/{ns}/{m.group(2)}"'

        # Re-serialize from object after updating src fields recursively
        def walk(obj: object) -> object:
            if isinstance(obj, dict):
                out = {}
                for k, v in obj.items():
                    if k == "src" and isinstance(v, str) and v.startswith("/blog/"):
                        m = re.match(r"^/blog/[^/]+/(.+)$", v)
                        out[k] = f"/blog/{new_slug}/{m.group(1)}" if m else v
                    else:
                        out[k] = walk(v)
                return out
            if isinstance(obj, list):
                return [walk(x) for x in obj]
            return obj

        data = walk(data)  # type: ignore[assignment]
        assert isinstance(data, dict)
        f.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )

        src_dir = MEDIA / f.stem
        dest_dir = MEDIA / new_slug
        if src_dir.is_dir():
            media_moves.append((src_dir, dest_dir))
        elif not dest_dir.is_dir():
            raise SystemExit(f"Missing media for {f.stem} -> {new_slug}")

    # Rename media (two-phase via stage to avoid collisions)
    stage = MEDIA / "_slug_stage"
    if stage.exists():
        shutil.rmtree(stage)
    stage.mkdir()
    for src, dest in media_moves:
        staged = stage / dest.name
        if staged.exists():
            # shared? copy merge
            for item in src.iterdir():
                if item.is_file():
                    target = staged / item.name
                    if not target.exists():
                        shutil.copy2(item, target)
        else:
            shutil.copytree(src, staged)

    for p in list(MEDIA.iterdir()):
        if p.is_dir() and p.name != "_slug_stage":
            shutil.rmtree(p)
    for staged in stage.iterdir():
        shutil.move(str(staged), str(MEDIA / staged.name))
    stage.rmdir()

    print(f"Articles updated: {len(stem_to_new)}; media dirs: {len(list(MEDIA.iterdir()))}")

    # blog.ts — replace localSlug values
    blog = BLOG_TS.read_text(encoding="utf-8")

    def repl_local_slug(m: re.Match[str]) -> str:
        old = m.group(1)
        new = old_to_new.get(old)
        if not new:
            return m.group(0)
        return f'localSlug: "{new}"'

    blog2, n_slug = re.subn(
        r'localSlug:\s*"([^"]+)"', repl_local_slug, blog
    )
    # Also fix any href strings that embed /blog-all/tpost/{old}
    def repl_href(m: re.Match[str]) -> str:
        prefix, old = m.group(1), m.group(2)
        new = old_to_new.get(old)
        if not new:
            return m.group(0)
        # productionPath stays pointing at production tilda for fallback —
        # only rewrite when it's clearly a local path builder later.
        # For productionPath keep old. For home.ts we rewrite separately.
        return m.group(0)

    BLOG_TS.write_text(blog2, encoding="utf-8")
    print(f"blog.ts localSlug replacements: {n_slug}")

    # home.ts + about.ts — local article hrefs
    for path in (HOME_TS, ABOUT_TS):
        text = path.read_text(encoding="utf-8")

        def repl_link(m: re.Match[str]) -> str:
            prefix, old = m.group(1), m.group(2)
            new = old_to_new.get(old)
            if not new:
                return m.group(0)
            # Map legacy tpost + bare /blog/{hash} to /blog/{new}
            if prefix.endswith("/en/blog-all/tpost/"):
                return f"/en/blog/{new}"
            if "blog-all/tpost/" in prefix or prefix == "/blog/":
                # about uses /blog/{hash-slug} without tpost
                if prefix.startswith("/en/"):
                    return f"/en/blog/{new}"
                return f"/blog/{new}"
            return m.group(0)

        # Match both /blog-all/tpost/X and /blog/X (hash form)
        pattern = re.compile(
            r'((?:/en)?/blog-all/tpost/|/en/blog/|/blog/)([a-z0-9][a-z0-9-]*)'
        )
        text2, n = pattern.subn(repl_link, text)
        path.write_text(text2, encoding="utf-8")
        print(f"{path.name} link replacements: {n}")

    # MEDIA_MAP
    if MEDIA_MAP.exists():
        data = json.loads(MEDIA_MAP.read_text(encoding="utf-8"))
        mapping = data.get("map", data)
        updated = 0
        for k, v in list(mapping.items()):
            if not isinstance(v, str) or not v.startswith("/blog/"):
                continue
            m = re.match(r"^/blog/([^/]+)/(.*)$", v)
            if not m:
                continue
            old_dir, rest = m.group(1), m.group(2)
            # old_dir may be previous stem or even older hash — try stem map then slug map
            new_dir = stem_to_new.get(old_dir) or old_to_new.get(old_dir)
            if not new_dir:
                # already new?
                if (MEDIA / old_dir).is_dir():
                    continue
                continue
            mapping[k] = f"/blog/{new_dir}/{rest}"
            updated += 1
        MEDIA_MAP.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        print(f"MEDIA_MAP updated: {updated}")

    # Write redirect map for the app
    redirect_map = {
        old: new for old, new in sorted(old_to_new.items()) if old != new
    }
    # Also map previous stem media names? Not needed for URLs.
    out = ROOT / "src/content/blog/slug-redirects.json"
    out.write_text(
        json.dumps(redirect_map, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Redirect map entries: {len(redirect_map)} -> {out}")

    # Verify media
    broken = []
    for f in ARTICLES.glob("*.json"):
        data = json.loads(f.read_text(encoding="utf-8"))
        for m in path_re.finditer(json.dumps(data)):
            p = MEDIA / m.group(1) / m.group(2)
            if not p.exists():
                broken.append(str(p))
    print(f"Broken media refs: {len(broken)}")
    for b in broken[:15]:
        print(" ", b)


if __name__ == "__main__":
    main()
