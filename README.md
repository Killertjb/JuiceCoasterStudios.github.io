# Juice Coster Studio website

A static site (no build step) for GitHub Pages. The home page lists every artist and service; each card opens that listing's own page.

## Structure

```
index.html            Home page (cards are generated from data/site.js)
styles.css, script.js Home page look and behaviour
data/site.js          Site name, contact details and the list of listings  <- edit this most
404.html              Page-not-found page
Website/
  shared/             Styles and script shared by artist pages (artist.css, common.js)
  _template/          Copy this to start a new listing
  JCS/Pages/          Music Production page + contact page
  NHS/ Moowit/        Artist pages (Pages/home.html, Media/ for files)
  Ploeter/            Print services page
```

## Add a new artist or service

1. Copy `Website/_template` to `Website/<Name>` and fill in the `REPLACE` / `NAME` placeholders in `Pages/home.html`. Put images and video in `Website/<Name>/Media/`.
2. Add an entry to `listings` in `data/site.js` (title, category `"Artist"` or `"Service"`, icon, summary, button text, and `url: "Website/<Name>/Pages/home.html"`).
3. Commit and push. The card and the filter buttons appear automatically.

## Update contact details

Edit `contact` in `data/site.js`. The home page footer and the contact page both read from it. Placeholder values (`your@email.com`, `#` social links) still need real ones.

## Conventions

- Keep page files at `Website/<Name>/Pages/home.html` so the relative paths in the template keep working.
- Use lowercase file names without spaces.
- Footer years fill in automatically via `<span data-year>`.

## Preview locally

```
python3 -m http.server 8000
```

then open http://localhost:8000
