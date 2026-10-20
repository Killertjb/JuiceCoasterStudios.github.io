# Site structure

The site is there to **advertise**: the home page lists every artist and service, and each listing has its own page. Artist pages show every release with its cover art; clicking the cover or a platform button goes straight to Spotify, Apple Music, YouTube and so on.

Every artist folder has the same files, and so does every service folder. Only the content differs.

## The tree

```
/
├─ index.html                  Home page: one card per listing
├─ 404.html                    "Page not found"
├─ contact/index.html          Studio-wide contact page
├─ README.md                   Short overview
│
├─ data/                       Site-wide settings (edit these most)
│   ├─ site.json                 Studio name, tagline, contact details, social links
│   ├─ listings.json             Which artists/services appear on the home page, in order
│   └─ platforms.json            Spotify, Apple Music, YouTube, ...: label, icon, colour
│
├─ artists/
│   └─ <artist>/               e.g. nhs, moowit  (see "Inside an artist folder")
├─ services/
│   └─ <service>/              e.g. music-production, ploeter-printing
│
├─ _templates/                 Copy these to start something new (not published by GitHub Pages)
│   ├─ artist/
│   └─ service/
│
├─ assets/                     Shared engine: you rarely touch this
│   ├─ css/  base.css  home.css  listing.css
│   └─ js/   lib.js  home.js  listing.js  contact.js
│
├─ tools/
│   ├─ new-listing.py            Create a new artist/service from the template
│   └─ check-site.py             Find typos and missing files before you commit
│
└─ docs/                       You are here
```

## Inside an artist folder

```
artists/<artist>/
├─ index.html              The page. Identical in every artist folder
├─ README.md               Who this is, how the page flows, checklist, notes
├─ profile.json            Name, tagline, bio, genres, images, colours, streaming and social links
├─ releases.json           Every single / EP / album: cover art + one link per platform
├─ videos.json             Music videos, visualisers
├─ events.json             Shows and live sets (upcoming first, past ones automatic)
├─ testimonials.json       Quotes
├─ contact/
│   ├─ contact.json          Public contact details shown on the page
│   └─ contact-sheet.md      Your working contact sheet (not shown on the site)
├─ policies/
│   ├─ policies.json         Which documents appear under "Policies & Terms"
│   ├─ README.md             What belongs here
│   └─ (your PDFs / HTML documents)
└─ media/
    ├─ README.md             What goes where, sizes, naming
    ├─ covers/               Release cover art
    ├─ photos/               Hero image, portraits, press photos, share image
    ├─ videos/               Short clips (big videos belong on YouTube)
    ├─ branding/             Logos, colours, fonts
    └─ press/                Press kit, one-sheet, rider
```

## Inside a service folder

Same as an artist folder, except the content files are different, because a service has offerings instead of releases:

| Artist has | Service has instead |
|------------|---------------------|
| `releases.json`, `videos.json`, `events.json` | `offerings.json`, `gallery.json`, `process.json` |
| `media/covers/` | `media/gallery/` |

Everything else (`index.html`, `README.md`, `profile.json`, `testimonials.json`, `contact/`, `policies/`, `media/` with its other folders) is identical.

## How a page is built

1. The visitor opens `artists/nhs/`. That folder's `index.html` loads the shared engine in `assets/`.
2. The engine reads the JSON files next to the page and builds the sections.
3. **A section only appears if its file has content.** A brand-new artist shows only what has been filled in so far.
4. The home page reads `data/listings.json`, then each listing's `profile.json` for the card. Edit a profile and the card updates; nothing is typed twice.
5. A listing with `"status": "draft"` in its `profile.json` is hidden from the home page (the page itself still works, so you can preview it).

## Adding a new artist or service

```
python3 tools/new-listing.py artist  "Artist Name"
python3 tools/new-listing.py service "Service Name"
```

That copies the template, adds the listing to `data/listings.json` as a draft, and tells you what to do next. Or do it by hand: copy `_templates/artist` (or `service`) to `artists/<name>` (or `services/<name>`), replace `{{NAME}}`, `{{SLUG}}`, `{{TYPE}}` and `{{FOLDER}}` in the files, and add one line to `data/listings.json`.

Before committing, run `python3 tools/check-site.py`. It reports JSON typos, missing files and broken links as errors, and unfinished things (placeholder emails, no cover art, sample content) as warnings.

## Rules that keep it working

- **Names are lowercase with hyphens and no spaces** (`summer-party.jpg`). GitHub Pages is case-sensitive, so `Cover.JPG` and `cover.jpg` are different files.
- **Folder names are the web address.** `artists/nhs/` becomes `.../artists/nhs/`. Renaming a folder changes the link, so also update `data/listings.json`.
- **Paths inside a listing's JSON are relative to that listing's folder** (`media/covers/song.jpg`).
- **Do not edit `index.html` in a listing** except the `<meta>` tags at the top. Change `assets/` to change every page at once.
- **The repository is public.** Never commit private phone numbers, contracts, ID documents or payment details. Public contact details only.
- **Shrink images** before uploading (covers about 1400 px square, photos under 400 KB). GitHub rejects any file over 100 MB, so long videos belong on YouTube.
- **Open the site through a web server**, not by double-clicking `index.html`: browsers block loading the JSON files from a plain file. On GitHub Pages this just works; locally run `python3 -m http.server 8000` and open http://localhost:8000.

## Link previews and search

Google runs the page's JavaScript, so listings are indexed. WhatsApp, Facebook and X do **not** run scripts, so a shared link only shows the `<meta>` description and `og:` tags at the top of that listing's `index.html`. Fill those in (including an `og:image` with the full web address of a share image) for good link previews.
