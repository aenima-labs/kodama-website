# kodama-website

Public site for **Kodama**, an Ænima Labs venture. Static HTML/CSS/JS, no build step, served by GitHub Pages at [kodama.house](https://kodama.house).

## What's here

- `index.html` — the landing page
- `styles.css` — hand-written CSS (Kodama Design System v2 palette: forest-deep, parchment, gold leaf)
- `main.js` — mobile menu, current-section highlight, reveal-on-scroll, and the stardust canvas around the tree
- `404.html` — the not-found page GitHub Pages serves for unknown paths
- `assets/tree.svg` — the traced moyogi bonsai from `kodama/assets/brand/tree/mark.svg`, ring removed, viewBox cropped. Used as a CSS mask so it can wear a gold gradient.
- `assets/og.png` — 1200×630 link-preview image
- `assets/fonts/` — self-hosted woff2 (Cinzel, EB Garamond, Inter, and Noto Serif JP subset to 木霊 and 一–六), all SIL Open Font License; the @font-face rules are at the top of `styles.css`
- `CNAME` — custom domain
- `.well-known/apple-app-site-association` — lists the iOS/macOS listener and donor apps under `webcredentials`, so they may use kodama.house passkeys (kodama.house is the passkey relying party). Keep the app IDs in step with the apps' entitlements. `.nojekyll` keeps GitHub Pages from skipping the dot-folder.

## Preview

```bash
python3 -m http.server 8721
```

## Deploying

Pushes to `main` are deployed by GitHub Pages. DNS lives in Route 53 and is managed by Terraform in the kodama repo (`infra/terraform/apex.tf`): the apex has GitHub Pages A/AAAA records and `www` is a CNAME to `chernov-consulting.github.io`, which GitHub redirects to the apex. The `dev.*` app subdomains are unaffected.
