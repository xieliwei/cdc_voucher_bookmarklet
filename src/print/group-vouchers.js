import { VOUCHER_TYPES } from "../constants.js";

const TYPE_ORDER = [VOUCHER_TYPES.HEARTLAND, VOUCHER_TYPES.SUPERMARKET];

export const VOUCHERS_PER_PAGE = 10;
export const GRID_COLUMNS = 2;
export const GRID_ROWS = 5;

/**
 * Group unused vouchers so each (type, amount) starts a new print section.
 * Within a section, vouchers are paginated in chunks of 10.
 *
 * @param {import('../collect.js').CollectedVoucher[]} vouchers
 */
export function groupVouchersForPrint(vouchers) {
  /** @type {Map<string, import('../collect.js').CollectedVoucher[]>} */
  const buckets = new Map();

  for (const v of vouchers) {
    const key = `${v.type}:${v.amount}`;
    if (!buckets.has(key)) {
      buckets.set(key, []);
    }
    buckets.get(key).push(v);
  }

  const keys = [...buckets.keys()].sort((a, b) => {
    const [typeA, amountA] = a.split(":");
    const [typeB, amountB] = b.split(":");
    const typeIdxA = TYPE_ORDER.indexOf(typeA);
    const typeIdxB = TYPE_ORDER.indexOf(typeB);
    const orderA = typeIdxA === -1 ? 99 : typeIdxA;
    const orderB = typeIdxB === -1 ? 99 : typeIdxB;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return Number(amountA) - Number(amountB);
  });

  return keys.map((key) => {
    const [type, amount] = key.split(":");
    const items = buckets.get(key) ?? [];
    /** @type {import('../collect.js').CollectedVoucher[][]} */
    const pages = [];
    for (let i = 0; i < items.length; i += VOUCHERS_PER_PAGE) {
      pages.push(items.slice(i, i + VOUCHERS_PER_PAGE));
    }
    return {
      type,
      amount: Number(amount),
      typeLabel: items[0]?.typeLabel ?? type,
      pages,
    };
  });
}
