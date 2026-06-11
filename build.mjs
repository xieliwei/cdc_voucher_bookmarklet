import { spawnSync } from "node:child_process";
import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const watch = process.argv.includes("--watch");

function runImageOptimization() {
  const script = path.join(__dirname, "scripts", "optimize_images.py");
  const candidates = [process.env.PYTHON, "python", "python3"].filter(Boolean);

  for (const py of candidates) {
    const result = spawnSync(py, [script], {
      cwd: __dirname,
      encoding: "utf-8",
      stdio: "pipe",
    });
    if (result.status === 0) {
      if (result.stdout) {
        process.stdout.write(result.stdout);
      }
      return;
    }
  }

  const generated = path.join(
    __dirname,
    "src",
    "generated",
    "voucher-type-images.js",
  );
  if (!fs.existsSync(generated)) {
    console.error(
      "Failed to optimize images (install Pillow: pip install pillow) and re-run npm run build",
    );
    process.exit(1);
  }
  console.warn("image optimization skipped; using existing generated file");
}

runImageOptimization();

const options = {
  entryPoints: ["src/index.js"],
  bundle: true,
  format: "iife",
  globalName: "CdcVoucherCollector",
  outfile: "dist/cdc-voucher-collector.js",
  minify: !watch,
  sourcemap: watch,
  target: ["chrome109", "firefox115", "safari16", "edge109"],
  legalComments: "none",
  treeShaking: true,
  drop: watch ? [] : ["console"],
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log("watching src/ -> dist/cdc-voucher-collector.js");
} else {
  await esbuild.build(options);
  console.log(`built ${options.outfile}`);
}
