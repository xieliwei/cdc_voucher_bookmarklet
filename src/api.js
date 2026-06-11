import { API_BASE } from "./constants.js";

/**
 * @returns {string}
 */
export function createSessionId() {
  const uuid =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
  return `rsg-voucher-${uuid}`;
}

/**
 * @param {string} path - e.g. `/vouchers/groups/{id}`
 * @param {RequestInit} [init]
 * @param {string} [sessionId]
 */
export async function apiFetch(path, init = {}, sessionId = createSessionId()) {
  const url = `${API_BASE}${path}`;
  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");
  headers.set("X-Redeem-Session-Id", sessionId);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, { ...init, headers });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `RedeemSG API ${response.status} ${response.statusText} for ${path}${body ? `: ${body.slice(0, 200)}` : ""}`,
    );
  }

  return response.json();
}

/**
 * @param {string} groupId
 * @param {string} [sessionId]
 */
export async function fetchVoucherGroup(groupId, sessionId) {
  const payload = await apiFetch(
    `/vouchers/groups/${encodeURIComponent(groupId)}`,
    { method: "GET" },
    sessionId,
  );

  if (payload?.object !== "grouped_vouchers") {
    throw new Error(
      `Unexpected API response object: ${payload?.object ?? "missing"}`,
    );
  }

  return payload;
}

/**
 * Request a single-voucher alias when the campaign requires it.
 *
 * @param {string} groupId
 * @param {string} voucherId
 * @param {string} [sessionId]
 * @returns {Promise<string>}
 */
export async function fetchVoucherAlias(groupId, voucherId, sessionId) {
  const payload = await apiFetch(
    "/vouchers/groups/alias",
    {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        voucher_ids: [voucherId],
      }),
    },
    sessionId,
  );

  if (!payload?.alias) {
    throw new Error("Alias API did not return an alias");
  }

  return payload.alias;
}
