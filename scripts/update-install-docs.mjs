import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildLoaderBookmarklet,
  pagesAssetUrl,
} from "./generate-loader-bookmarklet.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const REPO = "xieliwei/cdc_voucher_bookmarklet";
const VERSIONS_PATH = path.join(ROOT, "docs", "versions.json");
const INSTALL_PATH = path.join(ROOT, "docs", "install.html");

/**
 * @param {string} repo
 * @param {string} tag
 * @param {string} integrity
 * @param {string} bookmarklet
 */
function versionEntry(repo, tag, integrity, bookmarklet) {
  const scriptUrl = pagesAssetUrl(repo, tag);
  return {
    tag,
    released: new Date().toISOString().slice(0, 10),
    scriptUrl,
    integrity,
    bookmarklet,
    installPage: `https://${repo.split("/")[0]}.github.io/${repo.split("/")[1]}/install.html#${tag}`,
    releaseUrl: `https://github.com/${repo}/releases/tag/${tag}`,
  };
}

/**
 * @param {Array<{tag: string, released: string, scriptUrl: string, integrity: string, bookmarklet: string, installPage: string, releaseUrl: string}>} versions
 */
function renderInstallHtml(versions) {
  const rows = versions
    .map(
      (v) => `    <section class="version" id="${escapeAttr(v.tag)}">
      <h2>${v.tag} <span class="date">${v.released}</span></h2>
      <p><a class="bookmark" href="${escapeAttr(v.bookmarklet)}">CDC Voucher Print ${v.tag}</a></p>
      <details>
        <summary>Verify / manual install</summary>
        <ul>
          <li><a href="${escapeAttr(v.releaseUrl)}">Release notes</a></li>
          <li>Script: <code>${escapeHtml(v.scriptUrl)}</code></li>
          <li>SHA-384: <code>${escapeHtml(v.integrity)}</code></li>
        </ul>
        <pre>${escapeHtml(v.bookmarklet)}</pre>
      </details>
    </section>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CDC Voucher Print - install</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 44rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    .warn { background: #fff3cd; border: 1px solid #ffe69c; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; }
    a.bookmark { display: inline-block; font-size: 1.05rem; padding: 0.55rem 0.9rem; background: #111; color: #fff; text-decoration: none; border-radius: 6px; }
    .version { border-top: 1px solid #ddd; padding-top: 1.25rem; margin-top: 1.25rem; }
    .date { font-size: 0.9rem; font-weight: normal; color: #666; }
    code, pre { font-size: 0.82rem; word-break: break-all; }
    pre { background: #f4f4f4; padding: 0.75rem; overflow-x: auto; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>CDC Voucher Print</h1>
  <div class="warn">
    <strong>Warning:</strong> Bookmarklets are inherently dangerous. They run with full access to the page you are on,
    including your voucher wallet. Do not install without reading the
    <a href="https://github.com/${REPO}/blob/main/DISCLAIMER.md">disclaimer</a>
    and reviewing the source for the version you choose.
    <strong>Vibecoded:</strong> this repo was built with substantial AI assistance; review the code yourself before use.
  </div>
  <p>Pick a version below. Drag the link to your bookmarks bar. Each bookmark is pinned to that release and its SHA-384 hash.</p>
  <p><strong>Do not</strong> use a "latest" or main-branch URL. Install a specific version only after you have reviewed it.</p>
${rows}
</body>
</html>`;
}

/** @param {string} s */
function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** @param {string} s */
function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

/**
 * @param {{ tag: string }} a
 * @param {{ tag: string }} b
 */
function semverDesc(a, b) {
  const parse = (tag) => {
    const m = /^v(\d+)\.(\d+)\.(\d+)/.exec(tag);
    return m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
  };
  const [ma, mi, p] = parse(a.tag);
  const [mb, mj, q] = parse(b.tag);
  if (ma !== mb) {
    return mb - ma;
  }
  if (mi !== mj) {
    return mj - mi;
  }
  return q - p;
}

/**
 * @param {string} tag
 * @param {string} integrity
 */
/**
 * @param {string} tag
 */
function publishPagesBundle(tag) {
  const src = path.join(ROOT, "dist", "cdc-voucher-collector.js");
  const destDir = path.join(ROOT, "docs", "releases", tag);
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, path.join(destDir, "cdc-voucher-collector.js"));
}

export function upsertVersion(tag, integrity) {
  publishPagesBundle(tag);
  const scriptUrl = pagesAssetUrl(REPO, tag);
  const bookmarklet = buildLoaderBookmarklet(scriptUrl, integrity);

  /** @type {Array<{tag: string}>} */
  let versions = [];
  if (fs.existsSync(VERSIONS_PATH)) {
    versions = JSON.parse(fs.readFileSync(VERSIONS_PATH, "utf8"));
  }

  const filtered = versions.filter((v) => v.tag !== tag);
  filtered.unshift(versionEntry(REPO, tag, integrity, bookmarklet));
  filtered.sort(semverDesc);

  fs.mkdirSync(path.dirname(VERSIONS_PATH), { recursive: true });
  fs.writeFileSync(VERSIONS_PATH, `${JSON.stringify(filtered, null, 2)}\n`, "utf8");
  fs.writeFileSync(INSTALL_PATH, renderInstallHtml(filtered), "utf8");
  console.log(`updated ${VERSIONS_PATH} and ${INSTALL_PATH}`);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
) {
  const tag = process.argv[2];
  const integrity = process.argv[3];
  if (!tag || !integrity) {
    console.error("Usage: node scripts/update-install-docs.mjs vX.Y.Z sha384-...");
    process.exit(1);
  }
  upsertVersion(tag, integrity);
}
