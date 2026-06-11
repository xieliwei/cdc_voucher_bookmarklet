# CDC Voucher Print

Collects **one QR per unused voucher** from the [RedeemSG](https://voucher.redeem.gov.sg/) resident wallet and opens an **A4 print layout** (2x5 grid, up to 10 vouchers per page).

Repository: https://github.com/xieliwei/cdc_voucher_bookmarklet

## Disclaimer - use at your own risk

**Bookmarklets are inherently dangerous.** Running third-party JavaScript on a page where you hold vouchers gives that script the same browser access you have on that page, including voucher data and API calls.

**Do not blind trust this tool - even if you trust the author.** Review the [source code](https://github.com/xieliwei/cdc_voucher_bookmarklet) and the exact release you install before use. See [DISCLAIMER.md](DISCLAIMER.md) for the full terms (no warranty, no liability, not affiliated with RedeemSG/GovTech/CDC).

This repository was **vibecoded** (built with substantial AI assistance). Treat it as experimental and review the code yourself before use. See [DISCLAIMER.md](DISCLAIMER.md).

Your voucher link contains a **secret group id**. Anyone with that link can spend your vouchers. Do not share links, group ids, or API responses.

## Install (version-pinned bookmark)

The full script is ~31 KB - too large for a standalone `javascript:` URL. Instead, install a **small loader bookmark** (~400 bytes) that loads a **specific GitHub Release** of `cdc-voucher-collector.js`.

Each bookmark embeds:

- the **release tag** (e.g. `v0.1.0`) in the script URL
- the **SHA-384 hash** (Subresource Integrity) of that exact file

If the release file is replaced or tampered with after you install, the bookmark **silently does nothing**.

**Do not** install a "latest" or main-branch bookmark. Pick a version you have reviewed.

### Quick install

1. Open the [install page](https://xieliwei.github.io/cdc_voucher_bookmarklet/install.html) or [GitHub Releases](https://github.com/xieliwei/cdc_voucher_bookmarklet/releases)
2. Choose a **specific version**
3. **Drag** "CDC Voucher Print vX.Y.Z" to your bookmarks bar, **or** copy `loader-bookmarklet.txt` from that release into a new bookmark Location URL

### Usage

1. Open your CDC voucher link on `voucher.redeem.gov.sg`
2. Click the bookmark
3. Allow pop-ups if prompted - print preview opens automatically

### Verify before installing

For release `vX.Y.Z`, confirm:

- Script URL: `https://xieliwei.github.io/cdc_voucher_bookmarklet/releases/vX.Y.Z/cdc-voucher-collector.js` (GitHub Pages; required for SRI/CORS)
- GitHub Release attachment is for manual download only; the bookmark loads from Pages.
- SHA-384 in release notes matches the hash embedded in your bookmark
- Source at tag `vX.Y.Z` matches what you expect

Upgrading requires **installing a new bookmark** for a newer version you have reviewed.

## Bundle size

| Artifact | Approx. size |
|----------|-------------|
| `dist/cdc-voucher-collector.js` | ~31 KB |

Uses a vendored Nayuki QR encoder. The `qrcode` npm package is a **devDependency** for automated parity tests only.

## Development

```powershell
cd cdc_voucher_bookmarklet
npm install
npm test            # L1 payload tests + L2 encoder parity
npm run build       # -> dist/cdc-voucher-collector.js
```

### DevTools snippet (full API)

On the live voucher page, paste `dist/cdc-voucher-collector.js`:

```javascript
await CdcVoucherCollector.run({ print: true });
CdcVoucherCollector.detectPage();
await CdcVoucherCollector.verifyAgainstShowView();
```

### Release (maintainers)

```bash
git tag v0.1.0
git push origin v0.1.0
```

The [release workflow](.github/workflows/release.yml) runs automatically when you push a version tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

On tag push it will: run tests -> build the bundle -> compute SHA-384 -> generate the loader bookmarklet -> update `docs/install.html` on `main` -> publish a GitHub Release with assets (`cdc-voucher-collector.js`, `loader-bookmarklet-vX.Y.Z.txt`, `install-vX.Y.Z.html`, hash file).

Enable **GitHub Pages -> Deploy from `/docs`** so the install page is served at https://xieliwei.github.io/cdc_voucher_bookmarklet/install.html

Locally preview the same pipeline before tagging:

```powershell
npm run release:build
```

After publishing a GitHub Release, confirm the loader can load the script with SRI (requires CORS on the release asset):

```powershell
npm run release:check-cors -- v0.1.0
```

Then install the bookmark from the release (or `docs/install.html`) and click it on `voucher.redeem.gov.sg`. If the bookmark does nothing, check the browser console for a blocked script or integrity error; local testing uses `npm run release:serve` which sends `Access-Control-Allow-Origin: *`.

## Print layout

- **A4** portrait, **2 columns x 5 rows** - grid fills the sheet; row height scales with available space
- **Shared borders** between adjacent occupied vouchers; empty slots have no visible borders
- **Sheet header:** title (`{type} - ${amount}`) and campaign expiry
- **Per voucher:** 50:50 left/right panes - denomination and type image (left), QR with expiry below (right, centered)
- **Footer:** page number (`Page N of M`)
- New page for each voucher **type + denomination**

| Value | Colour |
|-------|--------|
| $2 | `#BC92AB` |
| $5 | `#6D8C4B` |
| $10 | `#FF7269` |
| $20 | `#B38300` |
| $50 | `#232D51` |
| $100 | `#BD6348` |

## Printing

The layout is sized for **A4 portrait** with **10 mm** margins (`190 mm x 277 mm` content). Browsers cannot set scale or duplex from CSS; choose these in the print dialog:

| Setting | Recommended |
|---------|-------------|
| Paper | A4 |
| Orientation | Portrait |
| Scale | **100%** / Actual size (not "Fit to page" or "Shrink to fit") |
| Duplex | **Single-sided / One-sided** (you can override if needed) |

The print preview shows a yellow tip with the same guidance (hidden when printing). If duplex is left on, CSS `break-before: right` tries to start each voucher page on a new sheet front, which may insert blank backs.

## QR compatibility

Merchants scan the **decoded text** (`rsg:...`), not the bitmap.

| Setting | Official RedeemSG | This tool |
|---------|-------------------|-----------|
| Payload (CDC) | `rsg:{voucherId}` | Same |
| Alias campaigns | `rsg:{alias}` | Same API |
| Error correction | H | H |
| Quiet zone | margin 1 module | margin 1 module |
| Centre logo on QR | Yes (show view) | No - type image beside QR |

**Verification levels:**

- **L1** - `npm test` (payload string tests)
- **L2** - `npm test` (Nayuki encoder parity vs `qrcode` npm)
- **L3** - `verifyAgainstShowView()` on live `/show` page
- **L4** - Manual: print/PDF, scan with phone, confirm `rsg:...` matches `qrPayload`

## Project layout

```
cdc_voucher_bookmarklet/
  assets/source/              type JPEG sources
  docs/install.html           drag-to-bar install index (GitHub Pages)
  docs/versions.json          per-release bookmark metadata
  src/print/                  QR encode + A4 layout
  scripts/
    generate-loader-bookmarklet.mjs
    update-install-docs.mjs
  dist/cdc-voucher-collector.js
  .github/workflows/release.yml
```

## API

```javascript
const result = await CdcVoucherCollector.collectVouchers();
await CdcVoucherCollector.print(result);
await CdcVoucherCollector.verifyAgainstShowView({ voucherId: "v_..." });
```

Each entry in `result.vouchers`:

```javascript
{
  id: "v_...",
  type: "heartland",
  typeLabel: "CDC Vouchers",
  amount: 2,
  state: "unused",
  qrPayload: "rsg:v_...",
}
```
