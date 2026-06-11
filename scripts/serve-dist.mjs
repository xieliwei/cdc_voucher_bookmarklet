import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const PORT = Number(process.env.PORT ?? 8765);

const server = http.createServer((req, res) => {
  const urlPath = req.url?.split("?")[0] ?? "/";
  const rel = urlPath === "/" ? "/cdc-voucher-collector.js" : urlPath;
  const filePath = path.join(DIST, path.basename(rel));

  if (!filePath.startsWith(DIST) || !fs.existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }

  const body = fs.readFileSync(filePath);
  res.writeHead(200, {
    "Content-Type": "application/javascript; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
  });
  res.end(body);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Serving ${DIST} at http://127.0.0.1:${PORT}/`);
  console.log("Bundle: http://127.0.0.1:" + PORT + "/cdc-voucher-collector.js");
  console.log("Use dist/loader-bookmarklet-local.txt with npm run release:build");
  console.log("Press Ctrl+C to stop.");
});
