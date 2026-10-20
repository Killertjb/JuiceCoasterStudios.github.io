# {{NAME}}

**Type:** artist  |  **Folder:** `{{FOLDER}}/`  |  **Status:** see `"status"` in `profile.json` (`draft` = hidden from the home page, `live` = visible)

> Write one or two lines here: who {{NAME}} is and how they work with Juice Coster Studio.

## What is in this folder

| File / folder | What it is | Where it shows on the page |
|---------------|-----------|----------------------------|
| `index.html` | The page itself. Identical in every artist folder, so only the `<meta>` tags at the top are edited | n/a |
| `profile.json` | Name, tagline, bio, genres, images, colours, streaming and social links | Hero, About, link buttons, and the card on the home page |
| `releases.json` | Every single, EP and album with cover art and a link per platform | **Music**: click the cover or a platform button to open it there |
| `videos.json` | Music videos and visualisers | **Videos** |
| `events.json` | Live shows and events (upcoming ones sort first) | **Live & Events** |
| `testimonials.json` | Quotes from fans and partners | **What People Say** |
| `contact/contact.json` | Public email, phone, WhatsApp, booking link | **Contact** |
| `contact/contact-sheet.md` | Your working contact sheet (not shown on the site) | n/a |
| `policies/` | Booking terms, licensing and other policies, listed in `policies.json` | **Policies & Terms** |
| `media/` | Cover art, photos, videos, branding, press kit | Everywhere |

A section only appears when its file has content, so a new artist page grows as you fill things in.

## Everyday jobs

**A new release comes out**
1. Save the cover as `media/covers/<release-id>.jpg`.
2. In `releases.json`, copy the `_example` block into the `releases` list and fill in the title, type (`single`, `ep` or `album`), date, cover path and the platform links that exist. Empty links are hidden.
3. Run `python3 tools/check-site.py`, then commit.

**A new show is announced:** add an entry to `events.json`. It moves to "past" by itself after the date.

**A new video:** add it to `videos.json` with its `youtubeId`; the thumbnail and link are automatic.

**Change the look for this artist only:** set `theme.accent` (a hex colour) and `theme.mode` (`dark` or `light`) in `profile.json`.

## Checklist before going live
- [ ] `profile.json`: name, tagline, summary (home-page card), bio, links
- [ ] Hero image in `media/photos/` and set in `profile.json` > `images.hero`
- [ ] Every release added with cover art and platform links
- [ ] `contact/contact.json` filled in
- [ ] Policies added (or left empty on purpose)
- [ ] `<meta>` description and link-preview tags at the top of `index.html`
- [ ] `"status": "live"` in `profile.json`
- [ ] `python3 tools/check-site.py` shows no errors

## Notes about {{NAME}}
Anything specific to this artist: agreements, release schedule, preferred platforms, brand notes.
