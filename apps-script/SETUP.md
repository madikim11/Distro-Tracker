# Distro Tracker — Google Sheet sync setup

Two pieces: a Google Sheet (data) and an Apps Script (backend). The site talks to the
Apps Script over HTTP; the Sheet itself needs no special structure beforehand — each
artist gets its own tab, created automatically the first time that artist syncs.

## 1. Google Sheet

Create a new, blank Google Sheet: [sheets.google.com](https://sheets.google.com) → Blank.
Name it whatever you like — the site never reads the file name, only tab names (one per artist).

## 2. Apps Script backend

1. In that Sheet, go to **Extensions → Apps Script**.
2. Delete the placeholder code and paste in the contents of **Code.gs** (in this folder).
3. Click **Deploy → New deployment**.
4. Click the gear icon next to "Select type" → choose **Web app**.
5. Set:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy**, and authorize it when Google prompts you (it's your own script acting on your own Sheet).
7. Copy the **Web app URL** it gives you (looks like `https://script.google.com/macros/s/AKfycb.../exec`).

## 3. Connect the site

Open `sync-config.js` (at the root of the distro-tracker folder) and paste the URL in:

```js
const SHEET_SYNC_URL = 'https://script.google.com/macros/s/.../exec';
```

Reload the site. Open an artist's page and you'll see a sync status line appear near the
top — it creates that artist's tab in the Sheet automatically on first sync (a few seconds
after page load).

## How it behaves

- **Adding an artist** works from either side: use **+ Add Artist** on the site, or just
  create a new tab directly in the Sheet — the dashboard checks for tabs it doesn't
  already know about and pulls them in automatically (within ~15 seconds of loading the
  dashboard). Every tab is treated as an artist **except** ones whose name starts with an
  underscore (e.g. `_Scratchpad`) — use that prefix for anything in this spreadsheet
  that isn't an artist tab, and the site will leave it alone entirely.
- **Editing on the website** pushes to the Sheet automatically about 1.5 seconds after
  you stop typing/clicking.
- **Editing the Sheet directly** gets pulled into the site the next time you load that
  artist's page, and automatically every ~30 seconds while that page stays open. The
  dashboard also refreshes every known artist automatically, about every 60 seconds
  while it's open. There's also a **Sync now** button (on an artist's page, or the
  dashboard-wide one) if you don't want to wait.
- If you edit both sides within the same ~30-second window, the website's version wins
  for that round — there's no merge of conflicting changes.
- Each artist's tab has four column blocks side by side: **A-B** (simple parameters,
  labeled "Checklist"), **D-K** (Product/Territory, one row per territory allocation,
  labeled "Distribution"), **M-P** (Manufacturing Plants, labeled "Manufacturing"), and
  **R-T** (Shipping Links, one row per link, labeled "Shipping Links"). Row 1 is a
  merged section-label cell above each block, row 2 is the actual column headers
  (`Parameter`/`Value`, `ID`/`Type`/etc.), and row 3 onward is data. Don't move these
  blocks or rename row 2's headers — the sync finds each block by looking for those
  exact labels in those exact columns. Everything else (the actual values) is yours to
  edit freely, and you can add or remove rows in the D-K/M-P/R-T blocks — a blank `ID`
  cell just means "this is a new row," and the site will assign it an ID on the next
  push.
- Formatting (colors, fonts, borders, column widths) is entirely yours to control — pushes
  only clear and rewrite cell values, never formatting or column sizing. The exceptions are
  the two header rows and the Parameters block's Value column (B). Every new artist tab
  (and every existing one, since this is reapplied on every push) gets its two-row header
  styled automatically: row 1's merged/bold/centered section labels, a light gray fill on
  row 2's column headers, and a black box outlining both rows per block — so you never have
  to set that up by hand again. In the Value column, every status field (D2C, Music,
  Manufacturing, etc.), each checklist's own Completed/Incomplete summary row (e.g. Art
  Proof), and each of that checklist's individual items (e.g. Art Proof: Mock-up created)
  get a dropdown limited to their valid options with a background color matching the
  site's badge for whatever's selected — also rebuilt automatically on every push, so
  picking a new value from the dropdown is the easiest way to edit those rows directly in
  the Sheet.
