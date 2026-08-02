# Nikkah Invitation — Mohammed Haris & Haseena Begam

A single-page, mobile-first Nikkah invitation website. Plain HTML/CSS/JS,
no build step, ready to host for free on **GitHub Pages**.

**Live site:** `https://m0hammedharis.github.io/Invitation/` (once Pages is enabled — see below)

## What's in here

```
index.html   — page structure & content
style.css    — all styling (fonts, colors, animations, responsive layout)
script.js    — countdown timer, copy-link button, scroll-reveal animations
assets/      — Open Graph preview image
```

Sections on the page: hero (Bismillah + names + date), a Quranic verse
(Surah Ar-Rum 30:21), a live countdown to the Nikkah, an event details card
with a "Get Directions" button and embedded map, a "copy invitation link"
share button, and a closing du'a in the footer.

## Customizing the placeholders

Everything is already filled in with the current details:

| What | Where | Current value |
|---|---|---|
| Names | `index.html` — `.names` block | Mohammed Haris K & Haseena Begam A |
| Date | `index.html` (hero + details) **and** `script.js` (`NIKKAH_DATE`) | Monday, 28 September 2026 |
| Venue | `index.html` — `.details-card` | HMO Auditorium |
| Google Maps link | `index.html` — `#directions-btn` `href` | https://maps.app.goo.gl/dmvWqomb78h47xn18 |
| Map embed | `index.html` — `.map-embed iframe` `src` | search query for "HMO Auditorium" |
| Page title / description / OG tags | `index.html` `<head>` | — |

To reuse this template for a different couple/date, update:

1. The text in `index.html` (names, tagline, date, venue).
2. `NIKKAH_DATE` in `script.js` — must match the date shown on the page,
   in `"YYYY-MM-DDTHH:MM:SS"` format (local time).
3. The `href` on `#directions-btn` and the `src` on the map `iframe` if the
   venue changes.
4. Colors/fonts in `style.css` (`:root` custom properties at the top) if you
   want a different palette.

## Enabling GitHub Pages

1. Push this repo to GitHub (see commands below).
2. On GitHub, open the repo → **Settings** → **Pages** (left sidebar).
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Under **Branch**, choose `main` and folder `/ (root)`, then **Save**.
5. Wait a minute for the first deployment, then your site will be live at:
   `https://m0hammedharis.github.io/Invitation/`

## Pushing to GitHub

```bash
git init                     # if not already a git repo
git add .
git commit -m "Add Nikkah invitation site"
git branch -M main
git remote add origin https://github.com/M0hammedHaris/Invitation.git
git push -u origin main
```

## Notes

- No dependencies beyond Google Fonts (loaded via CDN link tags).
- Countdown updates every 30 seconds; once the Nikkah date passes it swaps
  to a celebratory message.
- Scroll animations use `IntersectionObserver` and gracefully skip if the
  browser doesn't support it or the user has "reduce motion" enabled.
