# Data file reference

Every JSON file also carries a `_help` note and (where useful) an `_example` block at the top. Those two keys are documentation only: the site ignores anything starting with `_`. Copy the `_example` into the list when you add an entry. Empty values (`""` or `[]`) are hidden on the page.

> A comma or quote in the wrong place breaks a JSON file. Run `python3 tools/check-site.py` before committing, or open the page locally; it shows a yellow banner naming the file with the typo.

## Site-wide (`data/`)

### `site.json`
| Field | Meaning |
|-------|---------|
| `name`, `shortName`, `tagline`, `description` | `name` is the full studio name (home page title, page titles, footers). `shortName` is the abbreviation for tight spots (logo, "back" buttons). `tagline` and `description` are the other hero lines |
| `contact.email`, `phone`, `whatsapp`, `whatsappDisplay`, `location`, `hours` | Studio contact page and footer. `whatsapp` is digits only with country code |
| `links` | Studio social links, keyed by platform (`instagram`, `facebook`, `tiktok`, `youtube`, ...) |

### `listings.json`
`listings`: ordered list of `{ "type": "artist" | "service", "slug": "folder-name" }`.

### `platforms.json`
`platforms`: for each key (`spotify`, `appleMusic`, `youtube`, ...) a `label`, `icon` (emoji), `color` and `kind`. The key is what you use in `links` everywhere. Add a line to support a new platform. Order here is the order buttons appear in.

## Both artists and services

### `profile.json`
| Field | Meaning |
|-------|---------|
| `type`, `slug`, `name` | Identity. `name` is the title on the page and the home card |
| `fullName` | Hero title if different from `name` (e.g. "New Horizon Sky") |
| `badge` | Small label above the title (e.g. "Christian EDM Artist") |
| `tagline` | Line under the title |
| `summary` | One or two sentences for the **home-page card** and Google |
| `icon` | Emoji for the home-page card (used when there is no card image) |
| `quote` | `{ "text", "attribution" }`, a verse or motto under the title (artists) |
| `bioTitle`, `bio` | Heading and paragraphs of the About section (`bio` is a list) |
| `genres` | List of tags (artists) |
| `highlights` | `[{ "value": "10K+", "label": "Monthly listeners" }]` |
| `pillars` | `[{ "icon", "title", "text" }]` small value cards (artists) |
| `established` | Year (services); shows "Since 2024" in the footer |
| `images` | `hero` (page background), `card` (home-card picture), `portrait`, `logo`. Paths relative to the folder |
| `theme` | `mode` (`dark` or `light`) and `accent` (hex colour) |
| `links` | Streaming / social profile links, keyed by platform; shown as buttons under the title |
| `status` | `draft` (hidden from home page) or `live` |

### `testimonials.json`
`testimonials`: `[{ "quote", "author" }]`.

### `contact/contact.json`
`useSiteContact` (true = fill any empty field from `data/site.json`), `email`, `phone`, `whatsapp` (digits), `whatsappDisplay`, `location`, `hours`, `bookingUrl` + `bookingLabel` (a big button), `note` (line under the heading).

### `policies/policies.json`
`policies`: `[{ "title", "file": "policies/booking-terms.pdf", "summary" }]`.

## Artists only

### `releases.json`
`releases`, each with:

| Field | Meaning |
|-------|---------|
| `id` | Short name, also a good file name for the cover |
| `title` | Release title |
| `type` | `single`, `ep`, `album`, `compilation`, `remix` or `live`. Filter buttons appear automatically |
| `releaseDate` | `YYYY-MM-DD`. Newest first; a future date shows "Coming soon" |
| `genre` | Optional |
| `cover` | `media/covers/<id>.jpg`. A coloured placeholder is shown if missing |
| `links` | `{ "spotify": "...", "appleMusic": "...", "youtube": "..." }`. Empty ones are hidden. Any key from `platforms.json` works |
| `primary` | Which platform the cover itself opens (default: the first link) |
| `tracks` | Optional: `[{ "title", "links": { ... } }]` for an expandable tracklist |
| `icon` | Optional emoji on the placeholder cover |

### `videos.json`
`videos`: `{ "title", "youtubeId", "url", "thumbnail", "note" }`. With a `youtubeId` the link and thumbnail are automatic.

### `events.json`
`events`: `{ "title", "date": "YYYY-MM-DD", "location", "kind", "link": { "label", "url" } }`. Upcoming events sort first; later they become past automatically.

## Services only

### `offerings.json`
`offerings`: `{ "icon", "title", "description", "price", "image", "link": { "label", "url" } }`.

### `gallery.json`
`title` (section heading) and `images`: `{ "image": "media/gallery/work-01.jpg", "caption", "alt" }`.

### `process.json`
`title` and `steps`: `{ "title", "text" }`, numbered automatically.
