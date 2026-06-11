import { collectVouchers } from "./collect.js";
import { detectPage } from "./detect.js";
import { openPrintPreview, buildPrintHtml } from "./print/render.js";
import {
  verifyAgainstShowView,
  setLastCollectResult,
} from "./verify.js";

/**
 * Collect vouchers and optionally open the A4 print preview.
 *
 * @param {object} [options]
 * @param {boolean} [options.print=false]
 * @param {boolean} [options.autoPrint=true]
 * @returns {Promise<import('./collect.js').CollectResult>}
 */
export async function run(options = {}) {
  const { print = false, autoPrint = true, ...collectOptions } = options;

  const result = await collectVouchers({
    onProgress: (info) => console.log("[cdc-voucher]", info),
    ...collectOptions,
  });

  setLastCollectResult(result);
  console.log("CDC voucher collection result:", result);

  if (print) {
    await openPrintPreview(result, {
      autoPrint,
      onProgress: (info) => console.log("[cdc-voucher]", info),
    });
  }

  return result;
}

/**
 * @param {import('./collect.js').CollectResult} result
 * @param {object} [options]
 */
export async function print(result, options = {}) {
  return openPrintPreview(result, {
    onProgress: (info) => console.log("[cdc-voucher]", info),
    ...options,
  });
}

/**
 * @param {object} [options]
 * @returns {Promise<import('./collect.js').CollectResult>}
 */
export async function collectAndRemember(options = {}) {
  const result = await collectVouchers(options);
  setLastCollectResult(result);
  return result;
}

export {
  collectVouchers,
  detectPage,
  buildPrintHtml,
  openPrintPreview,
  verifyAgainstShowView,
};

if (typeof window !== "undefined") {
  window.CdcVoucherCollector = {
    run,
    print,
    collectVouchers,
    collectAndRemember,
    detectPage,
    buildPrintHtml,
    openPrintPreview,
    verifyAgainstShowView,
  };
}
