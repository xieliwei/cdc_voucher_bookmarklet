/**
 * @param {string|number|null|undefined} validityEnd
 * @param {string|null|undefined} validity
 * @returns {string|null}
 */
export function formatExpiry(validityEnd, validity) {
  if (validityEnd != null && validityEnd !== "") {
    const date = parseValidityEnd(validityEnd);
    if (date) {
      return formatDateEnSg(date);
    }
  }

  if (validity && String(validity).trim()) {
    return String(validity).trim();
  }

  return null;
}

/**
 * @param {string|number} value
 * @returns {Date|null}
 */
function parseValidityEnd(value) {
  if (typeof value === "number") {
    const ms = value < 1e12 ? value * 1000 : value;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const text = String(value).trim();
  if (!text) {
    return null;
  }

  if (/^\d+$/.test(text)) {
    const num = Number(text);
    const ms = num < 1e12 ? num * 1000 : num;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * @param {Date} date
 */
function formatDateEnSg(date) {
  return date.toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Singapore",
  });
}

/**
 * @param {string|null} formatted
 * @param {string} [prefix="Valid until"]
 */
export function expiryLabel(formatted, prefix = "Valid until") {
  if (!formatted) {
    return "";
  }
  return `${prefix} ${formatted}`;
}
