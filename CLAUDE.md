# FitnessDashboard-redirect

A single static `index.html` hosted on GitHub Pages. Its only purpose: give the
user a **permanent URL** to hand out to ~100-200 users, so that when the
underlying Google Apps Script (GAS) deployment URL changes, only this file
needs updating — never the URL shared with users.

## Live URL (never changes)
`https://sahilchopra03.github.io/FitnessDashboard-redirect/`

## Repo
`https://github.com/sahilchopra03/FitnessDashboard-redirect` (public, owner `sahilchopra03`)
GitHub Pages is enabled: source = `main` branch, path `/`. Auto-rebuilds within
~1 minute of any push to `main`. Response `cache-control: max-age=600` is fixed
by GitHub Pages (static hosting, no custom headers possible) — so a browser may
serve a stale copy for up to 10 minutes after a deploy. This is a known,
accepted limitation (Cloudflare Pages migration was considered and declined —
staying on GitHub Pages).

## What the page looks like
An exact copy of the V1 homepage (`Homepage.html` in
`/Users/sahilchopra0003/Projects/FitnessDashboard/V1/MasterDashboard/Code/`) as
Production serves it: the Phurtix logo, wordmark and tagline, light/dark theme,
and the Coach / Client role cards. It is **generated**, never hand-edited:
`build-from-v1.js` runs V1's real `doGet()` through that project's Node test
world and writes `index.html` (adding the `<title>` Apps Script sets on its
outer page, the icon tags, and pointing the two role links at `BASE_URL`) plus
`manifest.webmanifest`.

## Icons (favicon, bookmarks, iPhone + Android home screen)
Real files in `icons/` — iOS ignores a `data:` home-screen icon and Android reads
icons from the manifest. `make-icons.py` draws them with V1's own `dark_tile()`
(`V1/MasterDashboard/Brand/rebuild-runner.py`), the recipe of Production's icon:
`favicon-32.png` (tab + bookmarks), `apple-touch-icon.png` (180 px, iPhone/iPad
home screen + Safari bookmarks — byte-identical to Production's icon),
`icon-192/512.png` and `icon-maskable-512.png` (Android). The build refuses to run
if `apple-touch-icon.png` no longer matches V1's icon; then re-run
`python3 make-icons.py` (needs Pillow, numpy, scipy). Icon URLs carry a hash of
the icon files (`?v=`), so a new drawing busts browsers' long favicon caches.

## Updating it
Whenever the V1 homepage changes, or the Apps Script deployment URL changes
(edit the `BASE_URL` constant at the top of `build-from-v1.js`):

```bash
cd /Users/sahilchopra0003/Projects/FitnessDashboard-redirect
node build-from-v1.js          # reads ../FitnessDashboard by default
```

## Deploy workflow
This repo is already cloned locally at
`/Users/sahilchopra0003/Projects/FitnessDashboard-redirect`. To ship a URL
change:

```bash
cd /Users/sahilchopra0003/Projects/FitnessDashboard-redirect
node build-from-v1.js
git add -A
git commit -m "Rebuild from the V1 homepage"
git push
```

Then optionally verify with:
```bash
curl -s https://sahilchopra03.github.io/FitnessDashboard-redirect/ | grep -o 'href="https://script[^"]*"'
```
(may take ~30-60s after push for Pages to rebuild; poll a few times).

## ⚠️ File size / do not full-Read
`index.html` is ~130KB with long single-line base64 images (the logo). Don't
`Read` it whole and don't edit it by hand — change V1 or `build-from-v1.js` and
re-run the build.
