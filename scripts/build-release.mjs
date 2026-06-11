import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildLoaderBookmarklet } from "./generate-loader-bookmarklet.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const tag = process.argv[2] ?? `v${pkg.version}`;
const LOCAL_PORT = 8765;
const LOCAL_SCRIPT_URL = `http://127.0.0.1:${LOCAL_PORT}/cdc-voucher-collector.js`;

/**
 * @param {string} command
 * @param {string[]} args
 */
function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`Building release ${tag}...\n`);

run("npm", ["test"]);
run("npm", ["run", "build"]);
run("node", ["scripts/generate-loader-bookmarklet.mjs", "--tag", tag]);

const hashPath = path.join(ROOT, "dist", "cdc-voucher-collector.js.sha384");
const integrity = fs.readFileSync(hashPath, "utf8").trim();
run("node", ["scripts/update-install-docs.mjs", tag, integrity]);

const localBookmarklet = buildLoaderBookmarklet(LOCAL_SCRIPT_URL, integrity);
const localPath = path.join(ROOT, "dist", "loader-bookmarklet-local.txt");
fs.writeFileSync(localPath, localBookmarklet, "utf8");

console.log("\nRelease build complete.\n");
console.log("GitHub release bookmark:");
console.log(`  dist/loader-bookmarklet-${tag}.txt`);
console.log("\nLocal test (before GitHub publish):");
console.log(`  1. npm run release:serve`);
console.log(`  2. Install bookmark from dist/loader-bookmarklet-local.txt`);
console.log(`  3. Open voucher page and click bookmark`);
console.log(`\nSHA-384: ${integrity}`);
console.log(`Local script URL: ${LOCAL_SCRIPT_URL}`);
