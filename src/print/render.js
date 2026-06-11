import { VOUCHER_TYPE_IMAGES } from "../generated/voucher-type-images.js";
import { colorForDenomination } from "./denomination-colors.js";
import { expiryLabel, formatExpiry } from "./format-expiry.js";
import {
  GRID_COLUMNS,
  GRID_ROWS,
  groupVouchersForPrint,
  VOUCHERS_PER_PAGE,
} from "./group-vouchers.js";
import { payloadToDataUrl } from "./qr-encode.js";

const PRINT_CSS = `
@page {
  size: A4 portrait;
  margin: 10mm;
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  background: #fff;
  font-family: "Inter", "Segoe UI", system-ui, sans-serif;
}

.print-doc {
  width: 100%;
}

.voucher-sheet {
  width: 190mm;
  height: 277mm;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  page-break-after: always;
  break-after: page;
}

.voucher-sheet:last-child {
  page-break-after: auto;
  break-after: auto;
}

.sheet-header {
  flex: 0 0 auto;
  text-align: center;
  padding: 0 0 1mm;
}

.sheet-title {
  margin: 0;
  font-size: 10pt;
  font-weight: 700;
  line-height: 1.2;
}

.sheet-expiry {
  margin: 0.5mm 0 0;
  font-size: 8pt;
  color: #333;
}

.sheet-grid {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(5, 1fr);
  width: 100%;
  min-height: 0;
}

.voucher-slot--empty {
  width: 100%;
  height: 100%;
}

.voucher-cell {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 0.2cm;
  overflow: hidden;
  border-style: solid;
  border-color: #111;
  border-width: 0;
}

.voucher-cell.border-top {
  border-top-width: 0.5mm;
}

.voucher-cell.border-right {
  border-right-width: 0.5mm;
}

.voucher-cell.border-bottom {
  border-bottom-width: 0.5mm;
}

.voucher-cell.border-left {
  border-left-width: 0.5mm;
}

.voucher-left {
  display: grid;
  grid-template-rows: 1fr auto;
  align-items: center;
  justify-items: center;
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.voucher-amount-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 0;
  container-type: size;
}

.voucher-amount {
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
  text-align: center;
  font-size: min(36mm, 78cqh, 62cqmin);
}

.voucher-type-image {
  flex: 0 0 auto;
  width: auto;
  height: auto;
  max-height: 14mm;
  object-fit: contain;
  margin-bottom: 0.5mm;
}

.voucher-type-image-fallback {
  flex: 0 0 auto;
  font-size: 7pt;
  text-align: center;
  margin-bottom: 0.5mm;
}

.voucher-right {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.voucher-right-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  max-height: 100%;
  gap: 0.3mm;
}

.voucher-expiry {
  flex: 0 0 auto;
  text-align: center;
  font-size: 6pt;
  line-height: 1.1;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: min(4cm, 100%);
}

.voucher-qr {
  flex: 0 0 auto;
  width: min(4cm, 100%);
  height: min(4cm, 100%);
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 1;
  object-fit: contain;
  image-rendering: pixelated;
}

.sheet-footer {
  flex: 0 0 auto;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-top: 1mm;
  font-size: 8pt;
  color: #333;
}

.voucher-sheet + .voucher-sheet {
  break-before: right;
  page-break-before: right;
}

.print-instructions {
  max-width: 190mm;
  margin: 0 auto 12mm;
  padding: 4mm 6mm;
  font-size: 10pt;
  line-height: 1.4;
  color: #222;
  background: #fff8e6;
  border: 1px solid #e6c200;
  border-radius: 2mm;
}

@media screen {
  body {
    background: #ececec;
    padding: 12mm 0;
  }

  .voucher-sheet {
    background: #fff;
    box-shadow: 0 2mm 6mm rgba(0, 0, 0, 0.12);
    margin-bottom: 12mm;
  }
}

@media print {
  html, body {
    margin: 0;
    padding: 0;
    width: 190mm;
    background: #fff;
  }

  .print-instructions {
    display: none !important;
  }

  .print-doc {
    width: 190mm;
    margin: 0 auto;
  }

  .voucher-sheet {
    width: 190mm;
    height: 277mm;
    max-height: 277mm;
    margin: 0 auto;
    overflow: hidden;
    box-shadow: none;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .voucher-cell {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`;

/**
 * @param {string} payload
 * @returns {string}
 */
function qrToDataUrl(payload) {
  return payloadToDataUrl(payload, {
    sizePx: 472,
    margin: 1,
  });
}

/**
 * @param {number} index
 * @param {boolean[]} occupied
 */
function borderClassesForSlot(index, occupied) {
  const row = Math.floor(index / GRID_COLUMNS);
  const col = index % GRID_COLUMNS;
  /** @type {string[]} */
  const classes = [];

  const above = row > 0 && occupied[index - GRID_COLUMNS];
  const below = row < GRID_ROWS - 1 && occupied[index + GRID_COLUMNS];
  const left = col > 0 && occupied[index - 1];
  const right = col < GRID_COLUMNS - 1 && occupied[index + 1];

  if (row === 0 || !above) {
    classes.push("border-top");
  }
  if (col === 0 || !left) {
    classes.push("border-left");
  }
  if (col === GRID_COLUMNS - 1 || right || !right) {
    classes.push("border-right");
  }
  if (row === GRID_ROWS - 1 || below || !below) {
    classes.push("border-bottom");
  }

  return classes.join(" ");
}

/**
 * @param {import('../collect.js').CollectedVoucher} voucher
 * @param {string} qrDataUrl
 * @param {string} expiryText
 */
function renderVoucherCell(voucher, qrDataUrl, expiryText) {
  const typeImage = VOUCHER_TYPE_IMAGES[voucher.type];
  const amountColor = colorForDenomination(voucher.amount);
  const imgTag = typeImage
    ? `<img class="voucher-type-image" src="${typeImage.src}" width="${typeImage.width}" height="${typeImage.height}" alt="">`
    : `<div class="voucher-type-image-fallback">${escapeHtml(voucher.typeLabel)}</div>`;
  const expiryHtml = expiryText
    ? `<div class="voucher-expiry">${escapeHtml(expiryText)}</div>`
    : "";

  return `
    <div class="voucher-left">
      <div class="voucher-amount-wrap">
        <div class="voucher-amount" style="color:${amountColor}">$${voucher.amount}</div>
      </div>
      ${imgTag}
    </div>
    <div class="voucher-right">
      <div class="voucher-right-inner">
        <img class="voucher-qr" src="${qrDataUrl}" alt="">
        ${expiryHtml}
      </div>
    </div>`;
}

/**
 * @param {import('./group-vouchers.js').ReturnType<typeof groupVouchersForPrint>[number]} section
 * @param {import('../collect.js').CollectedVoucher[]} pageVouchers
 * @param {Map<string, string>} qrByPayload
 * @param {object} meta
 * @param {string} meta.expirySheetLabel
 * @param {string} meta.expiryCellLabel
 * @param {number} meta.pageNumber
 * @param {number} meta.totalPages
 */
function renderSheet(section, pageVouchers, qrByPayload, meta) {
  const occupied = Array.from({ length: VOUCHERS_PER_PAGE }, (_, i) =>
    Boolean(pageVouchers[i]),
  );

  const slots = [];
  for (let i = 0; i < VOUCHERS_PER_PAGE; i++) {
    const voucher = pageVouchers[i];
    if (!voucher) {
      slots.push('<div class="voucher-slot voucher-slot--empty"></div>');
      continue;
    }

    const borderClasses = borderClassesForSlot(i, occupied);
    const inner = renderVoucherCell(
      voucher,
      qrByPayload.get(voucher.qrPayload),
      meta.expiryCellLabel,
    );
    slots.push(
      `<div class="voucher-cell ${borderClasses}">${inner}</div>`,
    );
  }

  const sheetExpiry = meta.expirySheetLabel
    ? `<p class="sheet-expiry">${escapeHtml(meta.expirySheetLabel)}</p>`
    : "";

  return `
    <section class="voucher-sheet" data-type="${escapeHtml(section.type)}" data-amount="${section.amount}">
      <header class="sheet-header">
        <h1 class="sheet-title">${escapeHtml(section.typeLabel)} - $${section.amount}</h1>
        ${sheetExpiry}
      </header>
      <div class="sheet-grid">${slots.join("")}</div>
      <footer class="sheet-footer">Page ${meta.pageNumber} of ${meta.totalPages}</footer>
    </section>`;
}

/**
 * @param {string} text
 */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * @param {import('../collect.js').CollectResult} result
 * @param {(info: object) => void} [onProgress]
 * @returns {Promise<string>}
 */
export async function buildPrintHtml(result, onProgress) {
  const sections = groupVouchersForPrint(result.vouchers);
  const uniquePayloads = [
    ...new Set(result.vouchers.map((v) => v.qrPayload)),
  ];

  onProgress?.({ phase: "rendering-qr", total: uniquePayloads.length });

  /** @type {Map<string, string>} */
  const qrByPayload = new Map();
  for (let i = 0; i < uniquePayloads.length; i++) {
    const payload = uniquePayloads[i];
    qrByPayload.set(payload, qrToDataUrl(payload));
    if ((i + 1) % 5 === 0 || i === uniquePayloads.length - 1) {
      onProgress?.({
        phase: "rendering-qr",
        done: i + 1,
        total: uniquePayloads.length,
      });
    }
  }

  const expiryFormatted = formatExpiry(
    result.campaign?.validityEnd,
    result.campaign?.validity,
  );
  const expirySheetLabel = expiryLabel(expiryFormatted, "Valid until");
  const expiryCellLabel = expiryLabel(expiryFormatted, "Valid till");

  const totalPages = sections.reduce(
    (count, section) => count + section.pages.length,
    0,
  );

  const sheets = [];
  let pageNumber = 0;
  for (const section of sections) {
    for (const pageVouchers of section.pages) {
      pageNumber += 1;
      sheets.push(
        renderSheet(section, pageVouchers, qrByPayload, {
          expirySheetLabel,
          expiryCellLabel,
          pageNumber,
          totalPages,
        }),
      );
    }
  }

  const title = escapeHtml(result.campaign?.name ?? "CDC Vouchers");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title} - print</title>
  <style>${PRINT_CSS}</style>
</head>
<body>
  <p class="print-instructions"><strong>Print settings:</strong> A4 portrait, scale <strong>100%</strong> (not &ldquo;Fit to page&rdquo;), <strong>single-sided / one-sided</strong>. If duplex is on, blank backs may be inserted so each voucher page prints on its own sheet front.</p>
  <div class="print-doc">${sheets.join("")}</div>
</body>
</html>`;
}

/**
 * @param {import('../collect.js').CollectResult} result
 * @param {object} [options]
 * @param {boolean} [options.autoPrint=true]
 * @param {(info: object) => void} [options.onProgress]
 * @returns {Promise<Window|null>}
 */
export async function openPrintPreview(result, options = {}) {
  if (!result.vouchers?.length) {
    alert("No unused vouchers to print.");
    return null;
  }

  const { autoPrint = true, onProgress } = options;
  const html = await buildPrintHtml(result, onProgress);
  const win = window.open("", "_blank");
  if (!win) {
    throw new Error("Pop-up blocked. Allow pop-ups for voucher.redeem.gov.sg.");
  }
  win.document.open();
  win.document.write(html);
  win.document.close();

  if (autoPrint) {
    win.addEventListener("load", () => {
      win.focus();
      win.print();
    });
  }

  return win;
}
