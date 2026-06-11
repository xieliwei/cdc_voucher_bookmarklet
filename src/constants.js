/** Production RedeemSG public API (same as the voucher web app). */
export const API_BASE = "https://api-cdc.redeem.gov.sg/v1/public";

export const VOUCHER_HOST = "voucher.redeem.gov.sg";

/** Voucher types used by CDC campaigns on RedeemSG. */
export const VOUCHER_TYPES = Object.freeze({
  HEARTLAND: "heartland",
  SUPERMARKET: "supermarket",
});

export const VOUCHER_STATES = Object.freeze({
  UNUSED: "unused",
  REDEEMED: "redeemed",
  VOIDED: "voided",
});

/** Max vouchers the official UI allows in one combined QR (we do not use batching). */
export const OFFICIAL_MAX_VOUCHERS_PER_QR = 15;
