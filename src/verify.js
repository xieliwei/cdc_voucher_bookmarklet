import { collectVouchers } from "./collect.js";
import { decodeQrFromCanvas } from "./print/decode-qr.js";

/** @type {import("./collect.js").CollectResult | null} */
let lastCollectResult = null;

/**
 * Remember result for verifyAgainstShowView().
 * @param {import("./collect.js").CollectResult} result
 */
export function setLastCollectResult(result) {
  lastCollectResult = result;
}

/**
 * Decode the official show-view QR (#qr-code) and compare to our collected qrPayload.
 *
 * Prerequisites:
 * 1. Run collectVouchers() or run() first (or pass voucherId explicitly).
 * 2. On the wallet, select one unused voucher and tap Show voucher (/show).
 *
 * @param {object} [options]
 * @param {string} [options.voucherId] - if omitted, uses sole selected voucher when only one unused shown
 * @returns {Promise<{ match: boolean, official: string|null, expected: string|null, voucherId: string|null }>}
 */
export async function verifyAgainstShowView(options = {}) {
  const canvas = document.getElementById("qr-code");
  if (!canvas || canvas.tagName !== "CANVAS") {
    throw new Error(
      "No #qr-code canvas found. Select one voucher and tap Show voucher first.",
    );
  }

  const official = await decodeQrFromCanvas(canvas);
  if (!official) {
    throw new Error("Could not decode QR from official show view.");
  }

  let voucherId = options.voucherId ?? null;
  let expected = null;

  if (lastCollectResult) {
    const matches = lastCollectResult.vouchers.filter(
      (v) => v.qrPayload === official || v.id === voucherId,
    );
    if (!voucherId && matches.length === 1) {
      voucherId = matches[0].id;
      expected = matches[0].qrPayload;
    } else if (voucherId) {
      const v = lastCollectResult.vouchers.find((x) => x.id === voucherId);
      expected = v?.qrPayload ?? null;
    } else if (matches.length > 0) {
      expected = matches.find((v) => v.qrPayload === official)?.qrPayload ?? null;
      voucherId = matches.find((v) => v.qrPayload === official)?.id ?? null;
    }
  }

  if (!expected) {
    const result = await collectVouchers({ requirePageDetection: false });
    setLastCollectResult(result);
    const v = result.vouchers.find(
      (x) => x.qrPayload === official || x.id === voucherId,
    );
    expected = v?.qrPayload ?? null;
    voucherId = v?.id ?? voucherId;
  }

  const match = expected !== null && official === expected;
  const report = { match, official, expected, voucherId };
  console.log("CDC voucher QR verification:", report);
  return report;
}
