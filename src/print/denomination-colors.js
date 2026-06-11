/** Singapore note colours for printed denomination text. */
export const DENOMINATION_COLORS = Object.freeze({
  2: "#BC92AB",
  5: "#6D8C4B",
  10: "#FF7269",
  20: "#B38300",
  50: "#232D51",
  100: "#BD6348",
});

/**
 * @param {number} amount
 * @returns {string}
 */
export function colorForDenomination(amount) {
  return DENOMINATION_COLORS[amount] ?? "#111111";
}
