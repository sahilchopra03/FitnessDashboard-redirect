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
An exact UI replica of `Homepage.html` from the
`/Users/sahilchopra0003/Projects/FitnessDashboard/V1/MasterDashboard/Code/`
Apps Script project (the "SS Command Center" fitness app, V1): same logo,
same tagline ("Make Workout & Diet Planning Easy"), same subtitle ("Who's
logging in?"), and two role-picker cards (`.role-card.role-coach` /
`.role-card.role-client`) with icon, label, description, and arrow — **Coach**
and **Client** — that stack on mobile and sit side-by-side on desktop
(≥1024px). If the source project's Homepage.html changes again, re-diff it
against this file's `<style>`/body markup and port the changes over (the
embedded logo/favicon base64 never needs to change).

## The only thing that ever needs editing
`index.html` has one `BASE_URL` JS variable near the bottom of the file
(search for `EDIT ME`). Both button links are derived from it:

```js
var BASE_URL = "https://script.google.com/macros/s/XXXXXXXX/exec"; // EDIT ME
var COACH_URL = BASE_URL + "?app=coach";
var CLIENT_URL = BASE_URL + "?app=client";
```

To change the target Apps Script deployment: update only the `BASE_URL`
string (nothing else) — both COACH LOGIN and CLIENT LOGIN update automatically.

## Deploy workflow
This repo is already cloned locally at
`/Users/sahilchopra0003/Projects/FitnessDashboard-redirect`. To ship a URL
change:

```bash
cd /Users/sahilchopra0003/Projects/FitnessDashboard-redirect
# edit the BASE_URL line in index.html
git add index.html
git commit -m "Update BASE_URL to new Apps Script deployment"
git push
```

Then optionally verify with:
```bash
curl -s https://sahilchopra03.github.io/FitnessDashboard-redirect/ | grep -o 'BASE_URL = "[^"]*"'
```
(may take ~30-60s after push for Pages to rebuild; poll a few times).

## ⚠️ File size / do not full-Read
`index.html` is ~60KB in a single physical line for the embedded logo
(`<img class="login-logo" src="data:image/webp;base64,...">`, one line is
~57,000 characters) plus a smaller base64 favicon. **Do not use the `Read`
tool on the whole file** — it will exceed context limits. Instead:
- Use `grep -n` to find/edit specific lines (e.g. `grep -n "BASE_URL" index.html`).
- Use `sed`/`python3` for targeted line edits, or the `Edit` tool only after
  reading just the small relevant section via `sed -n '<start>,<end>p'`.
- The logo/favicon base64 data itself should never need to change — it was
  copied once from `OldFitnessDashboardSonu/Code/Index.html` (the
  `coach-login-brand` img and the `<link rel="icon">` href) and should be left
  alone.
