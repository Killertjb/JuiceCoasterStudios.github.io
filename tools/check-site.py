#!/usr/bin/env python3
"""Check the site for mistakes before you commit.

    python3 tools/check-site.py

Errors (exit code 1): missing required files, JSON typos, listings that point at folders that do not
exist, media or policy files named in a JSON file that are not there, broken links in the HTML pages.
Warnings: things that still look unfinished (placeholder emails, releases with no links, no cover art,
sample content). Needs only Python 3.
"""
import html.parser
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FOLDERS = {"artist": "artists", "service": "services"}

COMMON = ["index.html", "README.md", "profile.json", "testimonials.json",
          "contact/contact.json", "contact/contact-sheet.md",
          "policies/policies.json", "policies/README.md", "media/README.md"]
REQUIRED = {
    "artist": COMMON + ["releases.json", "videos.json", "events.json"],
    "service": COMMON + ["offerings.json", "gallery.json", "process.json"],
}
MEDIA_DIRS = {
    "artist": ["covers", "photos", "videos", "branding", "press"],
    "service": ["gallery", "photos", "videos", "branding", "press"],
}

errors, warnings = [], []


def err(msg): errors.append(msg)
def warn(msg): warnings.append(msg)
def rel(p): return str(Path(p).relative_to(ROOT))


def load_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return None
    except json.JSONDecodeError as e:
        err(f"{rel(path)}: invalid JSON, line {e.lineno} column {e.colno}: {e.msg} (look for a missing comma or quote)")
        return None


def media_refs(value, key=""):
    """Yield every string that points at a file inside the listing folder."""
    if isinstance(value, dict):
        if "title" in value and not str(value["title"]).strip():
            return                         # an empty slot (no title yet): the page ignores it, so do we
        for k, v in value.items():
            if k.startswith("_"):          # _help / _example blocks are documentation
                continue
            yield from media_refs(v, k)
    elif isinstance(value, list):
        for v in value:
            yield from media_refs(v, key)
    elif isinstance(value, str) and re.match(r"^(media|policies|contact)/", value):
        yield value


class Refs(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []

    def handle_starttag(self, tag, attrs):
        for k, v in attrs:
            if k in ("href", "src") and v:
                self.refs.append(v)


def check_html(page: Path):
    parser = Refs()
    parser.feed(page.read_text(encoding="utf-8"))
    for ref in parser.refs:
        if re.match(r"^(https?:|mailto:|tel:|data:|#|javascript:)", ref):
            continue
        path = ref.split("#")[0].split("?")[0]
        if not path or path == "/":
            continue
        target = (page.parent / path).resolve()
        if not target.exists():
            err(f"{rel(page)}: links to '{ref}' which does not exist")


def check_listing(kind: str, slug: str):
    folder = ROOT / FOLDERS[kind] / slug
    label = f"{FOLDERS[kind]}/{slug}"
    if not folder.is_dir():
        err(f"data/listings.json: {label} is listed but the folder does not exist")
        return
    for f in REQUIRED[kind]:
        if not (folder / f).exists():
            err(f"{label}: missing {f} (copy it from _templates/{kind}/, or run new-listing.py --merge)")
    for d in MEDIA_DIRS[kind]:
        if not (folder / "media" / d).is_dir():
            err(f"{label}: missing folder media/{d}/")

    data = {}
    for path in sorted(folder.rglob("*.json")):
        data[path.relative_to(folder).as_posix()] = load_json(path)

    profile = data.get("profile.json") or {}
    if profile.get("type") not in (None, kind):
        err(f"{label}/profile.json: type is '{profile.get('type')}' but the folder is under {FOLDERS[kind]}/")
    if profile.get("slug") not in (None, slug):
        warn(f"{label}/profile.json: slug is '{profile.get('slug')}' but the folder is '{slug}'")
    if profile.get("status") == "draft":
        warn(f"{label}: status is draft, so it is hidden from the home page")
    for field in ("name", "summary"):
        if not str(profile.get(field, "")).strip():
            warn(f"{label}/profile.json: '{field}' is empty (needed for the home-page card)")

    for name, content in data.items():
        for ref in media_refs(content):
            if not (folder / ref).exists():
                err(f"{label}/{name}: '{ref}' does not exist")

    all_releases = (data.get("releases.json") or {}).get("releases", [])
    releases = [r for r in all_releases if str(r.get("title", "")).strip()]   # empty slots are not releases yet
    empty_slots = len(all_releases) - len(releases)
    if empty_slots and not releases:
        warn(f"{label}: {empty_slots} empty release slot(s) in releases.json, none filled in yet")
    no_links = [r.get("title", "?") for r in releases if not any(str(v).strip() for v in (r.get("links") or {}).values())]
    no_cover = [r.get("title", "?") for r in releases if not str(r.get("cover", "")).strip()]
    no_date = [r.get("title", "?") for r in releases if not r.get("releaseDate")]
    sample = [r.get("title", "?") for r in releases if r.get("sample")]
    for what, titles in (("have no platform links yet", no_links), ("have no cover art yet", no_cover),
                         ("have no releaseDate", no_date), ("are sample content to replace", sample)):
        if titles:
            warn(f"{label}: {len(titles)} of {len(releases)} release(s) {what}: " + ", ".join(titles))

    contact = data.get("contact/contact.json") or {}
    if "your@email.com" in json.dumps(contact):
        warn(f"{label}/contact/contact.json: still has the placeholder email")
    if not any(str(contact.get(k, "")).strip() for k in ("email", "phone", "whatsapp")) and not contact.get("useSiteContact"):
        warn(f"{label}/contact/contact.json: no contact details yet")

    shell = folder / "index.html"
    if shell.exists():
        check_html(shell)
        if "TODO" in shell.read_text(encoding="utf-8"):
            warn(f"{label}/index.html: still has TODO text in the <meta> tags")


def main():
    listings = load_json(ROOT / "data" / "listings.json")
    if listings is None:
        err("data/listings.json is missing or invalid")
        listings = {}
    for name in ("site.json", "platforms.json"):
        if load_json(ROOT / "data" / name) is None and not (ROOT / "data" / name).exists():
            err(f"data/{name} is missing")

    site = load_json(ROOT / "data" / "site.json") or {}
    hero = str(site.get("heroImage", "")).strip()
    if hero and not (ROOT / hero).exists():
        err(f"data/site.json: heroImage '{hero}' does not exist (put the file in media/home/)")
    elif not hero:
        warn("data/site.json: heroImage is empty, so the home page shows the purple gradient (see media/home/README.md)")

    seen = set()
    for entry in listings.get("listings", []):
        kind, slug = entry.get("type"), entry.get("slug")
        if kind not in FOLDERS or not slug:
            err(f"data/listings.json: bad entry {entry} (needs type artist/service and a slug)")
            continue
        if (kind, slug) in seen:
            err(f"data/listings.json: {kind} '{slug}' is listed twice")
        seen.add((kind, slug))
        check_listing(kind, slug)

    # listings that exist on disk but are not on the home page list
    for kind, parent in FOLDERS.items():
        base = ROOT / parent
        if base.is_dir():
            for d in sorted(p for p in base.iterdir() if p.is_dir()):
                if (kind, d.name) not in seen:
                    warn(f"{parent}/{d.name} exists but is not in data/listings.json")

    for page in [ROOT / "index.html", ROOT / "404.html", ROOT / "contact" / "index.html"]:
        if page.exists():
            check_html(page)
        else:
            err(f"{rel(page)} is missing")

    for w in warnings:
        print("warning:", w)
    for e in errors:
        print("ERROR:  ", e)
    print(f"\n{len(errors)} error(s), {len(warnings)} warning(s)")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
