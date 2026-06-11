import { createSessionId, fetchVoucherAlias, fetchVoucherGroup } from "./api.js";
import { extractGroupIdFromLocation } from "./detect-slim.js";
import { detectPage } from "./detect.js";
import { labelForVoucherType, resolveCategoryPrefix } from "./labels.js";
import { buildSingleVoucherQrPayload } from "./qr.js";
import { VOUCHER_STATES } from "./constants.js";

/**
 * @typedef {object} CollectedVoucher
 * @property {string} id
 * @property {string} type
 * @property {string} typeLabel
 * @property {number} amount
 * @property {string} state
 * @property {string} qrPayload - content encoded in the QR (rsg:...)
 */

/**
 * @typedef {object} CollectResult
 * @property {boolean} ok
 * @property {string} groupId
 * @property {object} page
 * @property {object} campaign
 * @property {object} group
 * @property {CollectedVoucher[]} vouchers
 * @property {object} summary
 */

/**
 * @param {object} [options]
 * @param {string} [options.groupId] - override; defaults to URL path segment
 * @param {boolean} [options.requirePageDetection=true]
 * @param {(info: object) => void} [options.onProgress]
 * @returns {Promise<CollectResult>}
 */
export async function collectVouchers(options = {}) {
  const {
    groupId: groupIdOverride,
    requirePageDetection = true,
    onProgress,
  } = options;

  const page = detectPage();
  const groupId =
    groupIdOverride ?? page.groupId ?? extractGroupIdFromLocation();

  if (!groupId) {
    throw new Error(
      "No voucher group id found. Open your RedeemSG voucher link first.",
    );
  }

  if (requirePageDetection) {
    if (!page.canCollect) {
      throw new Error(
        "Not on a RedeemSG voucher link (need voucher.redeem.gov.sg with group id in URL). " +
          JSON.stringify(page.signals),
      );
    } else if (!page.isRedeemSgVoucherPage) {
      onProgress?.({
        phase: "warn",
        message:
          "Page detection signals are weak; continuing because URL looks like a voucher wallet.",
        signals: page.signals,
      });
    }
  }

  const sessionId = createSessionId();
  onProgress?.({ phase: "fetching", groupId });

  const payload = await fetchVoucherGroup(groupId, sessionId);
  const campaign = payload.campaign ?? {};
  const group = payload.data ?? {};
  const allVouchers = Array.isArray(group.vouchers) ? group.vouchers : [];

  const categoryPrefix = resolveCategoryPrefix(campaign);
  const extraQrPrefix = campaign.extra_qr_prefix ?? null;
  const aliasRequired = Boolean(campaign.is_voucher_alias_enabled);

  const unused = allVouchers.filter((v) => v.state === VOUCHER_STATES.UNUSED);

  onProgress?.({
    phase: "building-qr",
    unusedCount: unused.length,
    aliasRequired,
  });

  /** @type {CollectedVoucher[]} */
  const vouchers = [];

  for (let i = 0; i < unused.length; i++) {
    const v = unused[i];
    let alias = null;

    if (aliasRequired) {
      alias = await fetchVoucherAlias(groupId, v.id, sessionId);
    }

    const qrPayload = buildSingleVoucherQrPayload({
      voucherId: v.id,
      extraQrPrefix,
      alias,
    });

    vouchers.push({
      id: v.id,
      type: v.type,
      typeLabel: labelForVoucherType(v.type, categoryPrefix),
      amount: v.voucher_value,
      state: v.state,
      qrPayload,
    });

    if ((i + 1) % 10 === 0 || i === unused.length - 1) {
      onProgress?.({ phase: "building-qr", done: i + 1, total: unused.length });
    }
  }

  const byType = vouchers.reduce((acc, v) => {
    acc[v.type] = acc[v.type] || { count: 0, totalAmount: 0 };
    acc[v.type].count += 1;
    acc[v.type].totalAmount += v.amount;
    return acc;
  }, /** @type {Record<string, {count: number, totalAmount: number}>} */ ({}));

  const byAmount = vouchers.reduce((acc, v) => {
    const key = String(v.amount);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, /** @type {Record<string, number>} */ ({}));

  return {
    ok: true,
    groupId,
    page,
    campaign: {
      id: campaign.id,
      name: campaign.name,
      category: campaign.category,
      validity: campaign.validity,
      validityEnd: campaign.validity_end,
      categoryPrefix,
      isVoucherAliasEnabled: aliasRequired,
      extraQrPrefix,
    },
    group: {
      id: group.id,
      virtualAddress: group.virtual_address,
    },
    vouchers,
    summary: {
      total: allVouchers.length,
      unused: vouchers.length,
      redeemed: allVouchers.filter((v) => v.state === VOUCHER_STATES.REDEEMED)
        .length,
      voided: allVouchers.filter((v) => v.state === VOUCHER_STATES.VOIDED)
        .length,
      byType,
      byAmount,
    },
  };
}
