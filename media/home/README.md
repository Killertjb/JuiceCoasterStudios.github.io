# Media: home page

Pictures used by the studio's home page (the page with the artist and service cards).

## The banner (hero image)

The big area at the top of the home page can show a picture instead of the purple gradient.

1. Save the banner in **this folder**, for example `media/home/banner.jpg`.
2. Open `data/site.json` and set the path:
   ```json
   "heroImage": "media/home/banner.jpg"
   ```
3. Commit. The studio name, tagline and services line stay on top of the picture.

Optional settings in the same file:

| Setting | What it does | Default |
|---------|--------------|---------|
| `heroOverlay` | How much the whole picture is darkened. `0` = none, `0.9` = almost black. The text no longer depends on it: it sits on a frosted panel that follows the light/dark theme, so a bright, vivid banner works fine | `0.45` |
| `heroPosition` | Which part of the picture stays in view when it is cropped: `center`, `top`, `bottom`, `left`, `right`, or two words such as `center top` | `center` |

Leave `heroImage` empty (`""`) to go back to the purple gradient. If the file is missing or misspelled, the gradient is shown instead, and `python3 tools/check-site.py` reports the wrong path.

## What makes a good banner

- **Size:** about **2400 x 1200 px** (2:1). Anything at least 1920 px wide works.
- **File:** JPG or WebP, **under 400 KB**. Large files make the page slow on mobile data.
- **Keep the important part in the middle.** The picture fills the whole area and is cropped to fit: wide screens cut the top and bottom, phones cut the left and right.
- **Quiet in the middle.** The name and tagline are centred on top of it, so a very busy centre makes them hard to read. Raise `heroOverlay` if that happens.
- No text inside the picture: it is cropped differently on every screen, so the words would get cut off.

## Other files for this page
Logos, a share image for link previews (WhatsApp, Facebook) and similar can go here too. File names are lowercase with hyphens and no spaces: `studio-banner.jpg`.

## How the text stays readable
When a banner is set, the studio name, tagline and services line sit on a frosted panel: a light panel with dark text in light mode, a dark panel with light text in dark mode. Because the panel sits between the picture and the words, any banner works, bright or dark. The panel colours are `--hero-panel`, `--hero-panel-border` and `--hero-panel-shadow` at the top of `assets/css/home.css`. Without a banner the hero is the purple gradient with white text.
