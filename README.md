# kodama-website

Public site for **Kodama**, an Ænima Labs venture. Static HTML/CSS/JS, no build step, served by GitHub Pages at [kodama.house](https://kodama.house).

## What's here

- `index.html` — the landing page
- `styles.css` — hand-written CSS (Kodama Design System v2 palette: forest-deep, parchment, gold leaf)
- `main.js` — mobile menu, current-section highlight, reveal-on-scroll, and the stardust canvas around the tree
- `404.html` — the not-found page GitHub Pages serves for unknown paths
- `assets/tree.svg` — the traced moyogi bonsai from `kodama/assets/brand/tree/mark.svg`, ring removed, viewBox cropped. Used as a CSS mask so it can wear a gold gradient.
- `assets/og.png` — 1200×630 link-preview image
- Fonts (Cinzel, EB Garamond, Inter, Noto Serif JP) come from Google Fonts
- `CNAME` — custom domain

## Preview

```bash
python3 -m http.server 8721
```

## Deploying

Pushes to `main` are deployed by GitHub Pages. The apex `kodama.house` needs GitHub Pages A/AAAA records (or an ALIAS) at the DNS provider; the `api`, `platform` and `donor` subdomains are unaffected.
