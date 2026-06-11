import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, "..", "tests", ".out");
fs.mkdirSync(outDir, { recursive: true });

await esbuild.build({
  entryPoints: [path.join(root, "..", "tests", "qr-encoder-parity.test.mjs")],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: path.join(outDir, "qr-encoder-parity.mjs"),
  packages: "external",
});

console.log("bundled tests/.out/qr-encoder-parity.mjs");
