import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DEFAULT_REPO = "xieliwei/cdc_voucher_bookmarklet";
const ASSET_NAME = "cdc-voucher-collector.js";

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  /** @type {Record<string, string>} */
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--repo") {
      out.repo = argv[++i];
    } else if (arg === "--tag") {
      out.tag = argv[++i];
    } else if (arg === "--file") {
      out.file = argv[++i];
    } else if (arg === "--out-dir") {
      out.outDir = argv[++i];
    } else if (arg === "--script-url") {
      out.scriptUrl = argv[++i];
    }
  }
  return {
    repo: out.repo ?? process.env.GITHUB_REPOSITORY ?? DEFAULT_REPO,
    tag: out.tag ?? process.env.RELEASE_TAG,
    file: out.file ?? path.join(ROOT, "dist", ASSET_NAME),
    outDir: out.outDir ?? path.join(ROOT, "dist"),
    scriptUrl: out.scriptUrl,
  };
}

/**
 * @param {Buffer} bytes
 */
function sha384Integrity(bytes) {
  const digest = crypto.createHash("sha384").update(bytes).digest("base64");
  return `sha384-${digest}`;
}

/**
 * @param {string} repo
 * @param {string} tag
 */
function releaseAssetUrl(repo, tag) {
  return `https://github.com/${repo}/releases/download/${tag}/${ASSET_NAME}`;
}

/**
 * @param {string} scriptUrl
 * @param {string} integrity
 */
export function buildLoaderBookmarklet(scriptUrl, integrity) {
  const body = [
    "if(location.hostname!=='voucher.redeem.gov.sg')return",
    "var s=document.createElement('script')",
    "s.src=u",
    "s.integrity=h",
    "s.crossOrigin='anonymous'",
    "s.onload=function(){CdcVoucherCollector.run({print:true}).catch(function(e){alert(e.message||e)})}",
    "document.head.appendChild(s)",
  ].join(";");
  return `javascript:(function(u,h){${body}})(${JSON.stringify(scriptUrl)},${JSON.stringify(integrity)})`;
}

/**
 * @param {object} options
 * @param {string} options.repo
 * @param {string} options.tag
 * @param {string} options.bookmarklet
 * @param {string} options.integrity
 * @param {string} options.scriptUrl
 */
function buildInstallHtml({ repo, tag, bookmarklet, integrity, scriptUrl }) {
  const releasesUrl = `https://github.com/${repo}/releases/tag/${tag}`;
  const disclaimerUrl = `https://github.com/${repo}/blob/${tag}/DISCLAIMER.md`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CDC Voucher Print - install ${tag}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    .warn { background: #fff3cd; border: 1px solid #ffe69c; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; }
    a.bookmark { display: inline-block; font-size: 1.1rem; padding: 0.6rem 1rem; background: #111; color: #fff; text-decoration: none; border-radius: 6px; }
    code, pre { font-size: 0.85rem; word-break: break-all; }
    pre { background: #f4f4f4; padding: 0.75rem; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>CDC Voucher Print ${tag}</h1>
  <div class="warn">
    <strong>Warning:</strong> Bookmarklets are inherently dangerous. They run with full access to the page you are on,
    including your voucher wallet. Do not install without reading the
    <a href="${disclaimerUrl}">disclaimer</a> and reviewing the source for this release.
    <strong>Vibecoded:</strong> this repo was built with substantial AI assistance; review the code yourself before use.
  </div>
  <h2>Drag to bookmarks bar</h2>
  <p>Drag this link to your browser bookmarks bar, then use it on <code>voucher.redeem.gov.sg</code>:</p>
  <p><a class="bookmark" href="${bookmarklet.replace(/"/g, "&quot;")}">CDC Voucher Print ${tag}</a></p>
  <h2>Manual install</h2>
  <p>Create a bookmark and paste this as the Location URL:</p>
  <pre>${bookmarklet.replace(/</g, "&lt;")}</pre>
  <h2>Verify before use</h2>
  <ul>
    <li>Release: <a href="${releasesUrl}">${tag}</a></li>
    <li>Script URL: <code>${scriptUrl}</code></li>
    <li>SHA-384 (SRI): <code>${integrity}</code></li>
  </ul>
  <p>This bookmark is pinned to <strong>${tag}</strong> and the hash above. If the file changes, the bookmark silently does nothing.</p>
</body>
</html>`;
}

/**
 * @param {object} options
 * @param {string} options.repo
 * @param {string} options.tag
 * @param {string} options.bookmarklet
 * @param {string} options.integrity
 * @param {string} options.scriptUrl
 */
function buildReleaseNotes({ repo, tag, bookmarklet, integrity, scriptUrl }) {
  return `## CDC Voucher Print ${tag}

**Use at your own risk.** Review the [source](https://github.com/${repo}/tree/${tag}) and [disclaimer](https://github.com/${repo}/blob/${tag}/DISCLAIMER.md) before installing.

**Vibecoded:** this repository was built with substantial AI assistance. Review the code yourself before use.

### Install

1. Open the [install page](https://${repo.split("/")[0]}.github.io/${repo.split("/")[1]}/install.html) and drag **CDC Voucher Print ${tag}** to your bookmarks bar, **or**
2. Copy \`loader-bookmarklet.txt\` from this release into a new bookmark Location URL.

### Verify

- Script: \`${scriptUrl}\`
- SHA-384: \`${integrity}\`

The bookmark embeds both the URL and hash. If the release file is replaced, the bookmark silently does nothing.

### Usage

Open your CDC voucher link on voucher.redeem.gov.sg, then click the bookmark.

\`\`\`
${bookmarklet}
\`\`\`
`;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.tag) {
    console.error(
      "Usage: node scripts/generate-loader-bookmarklet.mjs --tag vX.Y.Z [--repo owner/name] [--script-url URL]",
    );
    process.exit(1);
  }

  const bytes = fs.readFileSync(args.file);
  const integrity = sha384Integrity(bytes);
  const scriptUrl = args.scriptUrl ?? releaseAssetUrl(args.repo, args.tag);
  const bookmarklet = buildLoaderBookmarklet(scriptUrl, integrity);

  fs.mkdirSync(args.outDir, { recursive: true });

  const tagSlug = args.tag.replace(/[^\w.-]/g, "_");
  const bookmarkletPath = path.join(args.outDir, `loader-bookmarklet-${tagSlug}.txt`);
  const hashPath = path.join(args.outDir, `${ASSET_NAME}.sha384`);
  const installPath = path.join(args.outDir, `install-${tagSlug}.html`);
  const releaseNotesPath = path.join(args.outDir, `release-notes-${tagSlug}.md`);

  fs.writeFileSync(bookmarkletPath, bookmarklet, "utf8");
  fs.writeFileSync(hashPath, `${integrity}\n`, "utf8");
  fs.writeFileSync(
    installPath,
    buildInstallHtml({ repo: args.repo, tag: args.tag, bookmarklet, integrity, scriptUrl }),
    "utf8",
  );
  fs.writeFileSync(
    releaseNotesPath,
    buildReleaseNotes({ repo: args.repo, tag: args.tag, bookmarklet, integrity, scriptUrl }),
    "utf8",
  );

  console.log(`tag: ${args.tag}`);
  console.log(`script_url: ${scriptUrl}`);
  console.log(`integrity: ${integrity}`);
  console.log(`bookmarklet_chars: ${bookmarklet.length}`);
  console.log(`wrote ${bookmarkletPath}`);
  console.log(`wrote ${hashPath}`);
  console.log(`wrote ${installPath}`);
  console.log(`wrote ${releaseNotesPath}`);
}
