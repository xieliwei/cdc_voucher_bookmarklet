/**
 * Build the QR payload string for exactly one voucher.
 *
 * Mirrors RedeemSG's show-QR logic (vK component in main bundle):
 *   prefix = "rsg" or "rsg-{extraQrPrefix}"
 *   if alias:  "{prefix}:{alias}"
 *   else:      "{prefix}:{voucherId}"
 *
 * @param {object} params
 * @param {string} params.voucherId
 * @param {string|null|undefined} params.extraQrPrefix
 * @param {string|null|undefined} [params.alias]
 * @returns {string}
 */
export function buildSingleVoucherQrPayload({
  voucherId,
  extraQrPrefix,
  alias,
}) {
  const prefix = extraQrPrefix ? `rsg-${extraQrPrefix}` : "rsg";
  const payloadBody = alias ?? voucherId;
  return `${prefix}:${payloadBody}`;
}
