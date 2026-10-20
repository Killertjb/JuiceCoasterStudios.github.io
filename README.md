# Juice Coster Studio website

A static website (no build step) hosted on GitHub Pages. It promotes the studio and the artists and services it works with. The home page lists every listing; each one opens its own page. Artist pages show every release with cover art, and clicking goes straight to the streaming platform you chose.

## Where things are

| Folder | What is in it |
|--------|---------------|
| `artists/<name>/` | One folder per artist, every one with the same files |
| `services/<name>/` | One folder per service, every one with the same files |
| `data/` | Site-wide settings: studio details, which listings show, platform names and colours |
| `_templates/` | Copy these to start a new artist or service |
| `assets/` | The shared page engine (styles and scripts) |
| `tools/` | `new-listing.py` and `check-site.py` |
| `docs/` | Full structure guide and a reference for every data field |

## Common jobs

```
python3 tools/new-listing.py artist "Artist Name"     # add an artist
python3 tools/new-listing.py service "Service Name"   # add a service
python3 tools/check-site.py                           # check for mistakes before committing
python3 -m http.server 8000                           # preview at http://localhost:8000
```

- **New release:** add it to the artist's `releases.json` and its cover to `media/covers/`.
- **New contact details:** edit `data/site.json` (studio) or the listing's `contact/contact.json`.
- **Show a new listing on the home page:** set `"status": "live"` in its `profile.json`.

Each artist and service folder has its own `README.md` explaining its files and a go-live checklist. Start with [`docs/STRUCTURE.md`](docs/STRUCTURE.md).

> This repository is public. Do not commit private phone numbers, contracts, ID documents or payment details.
