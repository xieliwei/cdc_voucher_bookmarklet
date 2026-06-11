import { QrCode } from "./vendor/qrcodegen.ts";

/**
 * @param {import("./vendor/qrcodegen.ts").QrCode} qr
 * @param {number} margin - quiet zone in modules (matches qrcode npm `margin` option)
 * @param {number} scale - pixels per module
 * @returns {{ width: number, height: number, data: Uint8ClampedArray }}
 */
export function qrToImageData(qr, margin = 1, scale = 8) {
  const modules = qr.size;
  const border = margin;
  const dim = (modules + border * 2) * scale;
  const data = new Uint8ClampedArray(dim * dim * 4);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = 255;
  }

  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      if (!qr.getModule(x, y)) {
        continue;
      }
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const px = (x + border) * scale + dx;
          const py = (y + border) * scale + dy;
          const i = (py * dim + px) * 4;
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 255;
        }
      }
    }
  }

  return { width: dim, height: dim, data };
}

/**
 * @param {string} text
 * @param {object} [options]
 * @param {number} [options.sizePx=472]
 * @param {number} [options.margin=1]
 * @returns {string} data:image/png;base64,...
 */
export function payloadToDataUrl(text, { sizePx = 472, margin = 1 } = {}) {
  const qr = QrCode.encodeText(text, QrCode.Ecc.HIGH);
  const totalModules = qr.size + margin * 2;
  const scale = Math.max(1, Math.floor(sizePx / totalModules));
  const { width, height, data } = qrToImageData(qr, margin, scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context unavailable");
  }
  ctx.putImageData(new ImageData(data, width, height), 0, 0);
  return canvas.toDataURL("image/png");
}
