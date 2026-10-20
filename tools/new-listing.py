#!/usr/bin/env python3
"""Create a new artist or service folder from _templates/ and add it to data/listings.json.

Usage:
    python3 tools/new-listing.py artist  "Artist Name"
    python3 tools/new-listing.py service "Service Name"
    python3 tools/new-listing.py artist  "Artist Name" --slug custom-folder-name

The new listing starts as a draft (hidden from the home page). Fill in its files, then set
"status": "live" in its profile.json. Needs only Python 3, no extra packages.
"""
import argparse
import html
import json
import re
import shutil
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FOLDERS = {"artist": "artists", "service": "services"}
TEXT_SUFFIXES = {".html", ".json", ".md"}


def slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    if not slug:
        sys.exit("Could not make a folder name from that title; pass --slug.")
    return slug


def fill_tokens(path: Path, tokens: dict) -> None:
    if path.suffix not in TEXT_SUFFIXES:
        return
    text = path.read_text(encoding="utf-8")
    for key, value in tokens.items():
        if path.suffix == ".json":
            value = json.dumps(value)[1:-1]       # safe inside a JSON string
        elif path.suffix == ".html":
            value = html.escape(value, quote=True)
        text = text.replace("{{" + key + "}}", value)
    path.write_text(text, encoding="utf-8")


def add_to_listings(kind: str, slug: str) -> bool:
    path = ROOT / "data" / "listings.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    entries = data.get("listings", [])
    if any(e.get("type") == kind and e.get("slug") == slug for e in entries):
        return False
    entries.append({"type": kind, "slug": slug})
    lines = ",\n".join(
        '    { "type": %s, "slug": %s }' % (json.dumps(e["type"]), json.dumps(e["slug"])) for e in entries
    )
    out = '{\n  "_help": %s,\n  "listings": [\n%s\n  ]\n}\n' % (json.dumps(data.get("_help", "")), lines)
    path.write_text(out, encoding="utf-8")
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("kind", choices=sorted(FOLDERS))
    parser.add_argument("name", help='Display name, e.g. "Ploeter Printing"')
    parser.add_argument("--slug", help="Folder name (default: made from the name)")
    parser.add_argument("--merge", action="store_true",
                        help="Folder already exists: add any template files that are missing, never overwrite")
    args = parser.parse_args()

    slug = args.slug or slugify(args.name)
    folder = ROOT / FOLDERS[args.kind] / slug
    template = ROOT / "_templates" / args.kind
    if not template.is_dir():
        sys.exit("Template folder missing: " + str(template))
    if folder.exists() and not args.merge:
        sys.exit(f"{folder.relative_to(ROOT)} already exists (use --merge to add missing template files only).")

    tokens = {"NAME": args.name, "SLUG": slug, "TYPE": args.kind,
              "FOLDER": f"{FOLDERS[args.kind]}/{slug}", "YEAR": str(date.today().year)}

    created = []
    for src in sorted(template.rglob("*")):
        if src.is_dir():
            continue
        dest = folder / src.relative_to(template)
        if dest.exists():
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dest)
        fill_tokens(dest, tokens)
        created.append(dest)

    added = add_to_listings(args.kind, slug)
    rel = folder.relative_to(ROOT)
    print(f"Created {rel}/ ({len(created)} files)")
    print("Added to data/listings.json" if added else "Already in data/listings.json")
    print(f"""
Next steps:
  1. Fill in {rel}/profile.json (and the other JSON files you need)
  2. Add images to {rel}/media/
  3. Set "status": "live" in profile.json when it is ready to appear on the home page
  4. python3 tools/check-site.py
""")


if __name__ == "__main__":
    main()
