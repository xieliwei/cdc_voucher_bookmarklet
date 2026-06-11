/**
 * Check whether a GitHub Release script URL sends CORS headers required for
 * cross-origin Subresource Integrity (loader uses crossOrigin="anonymous").
 *
 * Usage:
 *   node scripts/check-release-cors.mjs v0.1.0
 *   node scripts/check-release-cors.mjs https://github.com/owner/repo/releases/download/vX.Y.Z/cdc-voucher-collector.js
 *
 * Exit 0 if Access-Control-Allow-Origin is present on the final response.
 * Exit 1 if missing or the asset is unreachable (404, network error).
 */

const DEFAULT_REPO = "xieliwei/cdc_voucher_bookmarklet";
const ASSET = "cdc-voucher-collector.js";
const ORIGIN = "https://voucher.redeem.gov.sg";

/**
 * @param {string} input
 */
function resolveScriptUrl(input) {
  if (input.startsWith("http://") || input.startsWith("https://")) {
    return input;
  }
  const tag = input.startsWith("v") ? input : `v${input}`;
  return `https://github.com/${DEFAULT_REPO}/releases/download/${tag}/${ASSET}`;
}

/**
 * @param {string} url
 */
async function headWithCors(url) {
  let current = url;
  for (let hop = 0; hop < 8; hop++) {
    const response = await fetch(current, {
      method: "HEAD",
      redirect: "manual",
      headers: { Origin: ORIGIN },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        throw new Error(`Redirect ${response.status} without Location header`);
      }
      current = new URL(location, current).href;
      continue;
    }

    return { url: current, status: response.status, headers: response.headers };
  }

  throw new Error("Too many redirects");
}

const input = process.argv[2];
if (!input) {
  console.error(
    "Usage: node scripts/check-release-cors.mjs vX.Y.Z | SCRIPT_URL",
  );
  process.exit(1);
}

const scriptUrl = resolveScriptUrl(input);
console.log(`Checking: ${scriptUrl}`);
console.log(`Origin:   ${ORIGIN}`);

try {
  const { url, status, headers } = await headWithCors(scriptUrl);
  const acao = headers.get("access-control-allow-origin");

  console.log(`Final URL: ${url}`);
  console.log(`Status:    ${status}`);
  console.log(`ACAO:      ${acao ?? "(missing)"}`);

  if (status === 404) {
    console.error(
      "\nAsset not found. Publish the GitHub Release first, then re-run this check.",
    );
    process.exit(1);
  }

  if (status < 200 || status >= 300) {
    console.error(`\nUnexpected HTTP status ${status}.`);
    process.exit(1);
  }

  if (!acao) {
    console.error(
      "\nFAIL: No Access-Control-Allow-Origin on the release asset.",
    );
    console.error(
      "The loader bookmark uses SRI + crossOrigin=anonymous; browsers block the script without CORS.",
    );
    console.error(
      "Options: host cdc-voucher-collector.js on a CORS-enabled CDN, GitHub Pages, or a proxy.",
    );
    process.exit(1);
  }

  console.log("\nOK: CORS header present. Test the bookmark on voucher.redeem.gov.sg in a browser.");
} catch (err) {
  console.error(`\nError: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}
