/**
 * Decode QR text from a canvas (official show view).
 * Requires BarcodeDetector (Chrome/Edge).
 *
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<string|null>}
 */
export async function decodeQrFromCanvas(canvas) {
  if (typeof BarcodeDetector === "undefined") {
    console.warn(
      "BarcodeDetector unavailable. Use Chrome/Edge or scan with a phone for L4 verification.",
    );
    return null;
  }

  try {
    const detector = new BarcodeDetector({ formats: ["qr_code"] });
    const codes = await detector.detect(canvas);
    if (codes.length > 0 && codes[0].rawValue) {
      return codes[0].rawValue;
    }
  } catch {
    // fall through
  }

  return null;
}
