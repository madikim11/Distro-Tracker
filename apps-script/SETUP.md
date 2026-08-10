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

- **Editing on the website** pushes to the Sheet automatically about 1.5 seconds after
  you stop typing/clicking.
- **Editing the Sheet directly** gets pulled into the site the next time you load that
  artist's page, and automatically every ~30 seconds while that page stays open. There's
  also a **Sync now** button if you don't want to wait.
- If you edit both sides within the same ~30-second window, the website's version wins
  for that round — there's no merge of conflicting changes.
- Don't rename the `PARAMETERS` / `PRODUCT` / `TERRITORY BREAKDOWN` section headers or the
  column header rows the sync writes — it reads a tab back by looking for those exact
  labels. Everything else (the actual values) is yours to edit freely, and you can add or
  remove Product/Territory rows — a blank `ID` or `Product ID` cell just means "this is a
  new row," and the site will assign it an ID on the next push.
