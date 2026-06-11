import assert from "node:assert/strict";
import jsQR from "jsqr";
import QRCode from "qrcode";
import { qrToImageData } from "../src/print/qr-encode.js";
import { QrCode } from "../src/print/vendor/qrcodegen.ts";

const SAMPLE_PAYLOADS = [
  "rsg:v_test000000000000001",
  "rsg:v_test000000000000002",
  "rsg:ALIAS00000000001",
];

/**
 * @param {string} payload
 */
async function decodeWithQrcodeNpm(payload) {
  const dataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 472,
  });
  const base64 = dataUrl.split(",")[1];
  const png = Buffer.from(base64, "base64");
  const { data, width, height } = await pngToRgba(png);
  const code = jsQR(data, width, height);
  return code?.data ?? null;
}

/**
 * @param {string} payload
 */
function decodeWithNayuki(payload) {
  const qr = QrCode.encodeText(payload, QrCode.Ecc.HIGH);
  const totalModules = qr.size + 2;
  const scale = Math.max(1, Math.floor(472 / totalModules));
  const { data, width, height } = qrToImageData(qr, 1, scale);
  const code = jsQR(data, width, height);
  return code?.data ?? null;
}

/** Minimal PNG RGBA reader for test QR output (color PNG from qrcode npm). */
async function pngToRgba(buffer) {
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  const PNG = require("pngjs").PNG;
  const png = PNG.sync.read(buffer);
  return {
    data: new Uint8ClampedArray(png.data.buffer, png.data.byteOffset, png.data.length),
    width: png.width,
    height: png.height,
  };
}

for (const payload of SAMPLE_PAYLOADS) {
  const fromNpm = await decodeWithQrcodeNpm(payload);
  const fromNayuki = decodeWithNayuki(payload);
  assert.equal(fromNpm, payload, `qrcode npm decode for ${payload}`);
  assert.equal(fromNayuki, payload, `nayuki decode for ${payload}`);
  assert.equal(fromNayuki, fromNpm, `parity for ${payload}`);
}

console.log("qr-encoder-parity.test.mjs: all passed");
