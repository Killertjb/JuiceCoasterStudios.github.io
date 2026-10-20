# {{NAME}}

**Type:** service  |  **Folder:** `{{FOLDER}}/`  |  **Status:** see `"status"` in `profile.json` (`draft` = hidden from the home page, `live` = visible)

> Write one or two lines here: what {{NAME}} does and who runs it.

## What is in this folder

| File / folder | What it is | Where it shows on the page |
|---------------|-----------|----------------------------|
| `index.html` | The page itself. Identical in every service folder, so only the `<meta>` tags at the top are edited | n/a |
| `profile.json` | Name, tagline, description, images, colours and social links | Hero, About, link buttons, and the card on the home page |
| `offerings.json` | The products or services you provide, with optional prices | **What We Offer** |
| `gallery.json` | Photos of finished work (files live in `media/gallery/`) | **Our Work** |
| `process.json` | The steps from first contact to delivery | **How It Works** |
| `testimonials.json` | Client reviews | **What People Say** |
| `contact/contact.json` | Public email, phone, WhatsApp, booking / quote link | **Contact** |
| `contact/contact-sheet.md` | Your working contact sheet (not shown on the site) | n/a |
| `policies/` | Terms, refund and delivery policies, listed in `policies.json` | **Policies & Terms** |
| `media/` | Gallery photos, branding, brochures | Everywhere |

A section only appears when its file has content, so a new service page grows as you fill things in.

## Everyday jobs

**A new product or service:** copy the `_example` block in `offerings.json` into the `offerings` list.

**New work to show off:** save the photo in `media/gallery/`, then add it to `gallery.json` with a caption and alt text.

**Change the look for this service only:** set `theme.accent` (a hex colour) and `theme.mode` (`dark` or `light`) in `profile.json`.

## Checklist before going live
- [ ] `profile.json`: name, tagline, summary (home-page card), description, links
- [ ] Offerings added
- [ ] Gallery photos added and shrunk to a sensible size
- [ ] `contact/contact.json` filled in (or `useSiteContact` set to true)
- [ ] Policies added (or left empty on purpose)
- [ ] `<meta>` description and link-preview tags at the top of `index.html`
- [ ] `"status": "live"` in `profile.json`
- [ ] `python3 tools/check-site.py` shows no errors

## Notes about {{NAME}}
Anything specific to this service: pricing rules, turnaround times, suppliers, brand notes.
