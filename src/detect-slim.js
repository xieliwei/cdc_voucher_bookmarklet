import { VOUCHER_HOST } from "./constants.js";

const STATIC_PATH_SEGMENTS = new Set(["404", "expired-nea-cfhp-vouchers"]);
const MIN_GROUP_ID_LENGTH = 20;

/**
 * @param {string} segment
 */
function looksLikeGroupId(segment) {
  return (
    typeof segment === "string" &&
    segment.length >= MIN_GROUP_ID_LENGTH &&
    /^[A-Za-z0-9_-]+$/.test(segment)
  );
}

/**
 * @param {Location} loc
 * @param {string|null} groupId
 */
export function pathMatchesGroup(loc, groupId) {
  if (!groupId) {
    return false;
  }
  const normalized = loc.pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === `/${groupId}` ||
    normalized.startsWith(`/${groupId}/`)
  );
}

/**
 * Extract the voucher-group id from the current page URL path.
 *
 * @param {Location} [loc]
 * @returns {string|null}
 */
export function extractGroupIdFromLocation(loc = window.location) {
  if (loc.hostname !== VOUCHER_HOST) {
    return null;
  }

  const segment = loc.pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
  if (!segment || STATIC_PATH_SEGMENTS.has(segment)) {
    return null;
  }

  return looksLikeGroupId(segment) ? segment : null;
}

/**
 * Minimal URL guard: hostname + group id in URL path.
 *
 * @param {Location} [loc]
 */
export function canCollectFromUrl(loc = window.location) {
  const groupId = extractGroupIdFromLocation(loc);
  return loc.hostname === VOUCHER_HOST && groupId !== null && pathMatchesGroup(loc, groupId);
}
