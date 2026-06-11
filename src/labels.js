import { VOUCHER_TYPES } from "./constants.js";

const TYPE_LABEL_TEMPLATES = {
  [VOUCHER_TYPES.HEARTLAND]: "{{prefix}} Vouchers",
  [VOUCHER_TYPES.SUPERMARKET]: "{{prefix}} Supermarket Vouchers",
};

/**
 * @param {object} campaign
 * @returns {string}
 */
export function resolveCategoryPrefix(campaign) {
  const fromFeatures = campaign?.features?.category_prefix;
  if (fromFeatures) {
    return fromFeatures;
  }

  const name = campaign?.name || "";
  const cdcMatch = name.match(/^CDC\b/i);
  if (cdcMatch) {
    return "CDC";
  }

  return (campaign?.category || "Voucher").toUpperCase();
}

/**
 * @param {string} type - heartland | supermarket
 * @param {string} categoryPrefix
 * @returns {string}
 */
export function labelForVoucherType(type, categoryPrefix) {
  const template =
    TYPE_LABEL_TEMPLATES[type] || "{{prefix}} {{type}} Vouchers";
  return template
    .replace("{{prefix}}", categoryPrefix)
    .replace("{{type}}", type);
}
