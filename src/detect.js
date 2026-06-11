import {
  extractGroupIdFromLocation,
  pathMatchesGroup,
} from "./detect-slim.js";
import { VOUCHER_HOST } from "./constants.js";

export { extractGroupIdFromLocation } from "./detect-slim.js";

function collectDomSignals() {
  const root = document.getElementById("root");
  const rootHasContent = !!root && root.childElementCount > 0;

  return {
    reactRoot: !!root,
    reactRootPopulated: rootHasContent,
    selectVoucherTypePage: !!document.getElementById("select-voucher-type-page"),
    selectVoucherTypeContainer: !!document.getElementById(
      "select-voucher-type-container",
    ),
    voucherGroupPage: !!document.getElementById("voucher-group-page"),
    qrShowView: !!document.getElementById("qrcode-reference-container"),
    qrCanvas: !!document.getElementById("qr-code"),
    redemptionCard: !!document.querySelector(".redemption-card"),
    voucherTile: !!document.querySelector("[id^='rsg-voucher-']"),
    redeemButton: !!document.getElementById("redeem-button"),
  };
}

function collectMetaSignals() {
  const title = document.title || "";
  const description =
    document.querySelector('meta[name="description"]')?.content || "";
  const ogImage =
    document.querySelector('meta[property="og:image"]')?.content || "";

  return {
    redeemSgTitle: /RedeemSG/i.test(title),
    cdcTitle: /CDC\s+Vouchers?/i.test(title),
    voucherTitle: /vouchers?/i.test(title),
    redeemSgMetaDescription: /redeemsg|trusted voucher/i.test(description),
    redeemSgOgImage: /voucher\.redeem\.gov\.sg|redeem\.gov\.sg/i.test(
      ogImage,
    ),
  };
}

/**
 * @param {Location} [loc]
 */
export function detectPage(loc = window.location) {
  const groupId = extractGroupIdFromLocation(loc);
  const meta = collectMetaSignals();
  const dom = collectDomSignals();

  const hostnameOk = loc.hostname === VOUCHER_HOST;
  const groupIdInPath = groupId !== null;
  const pathMatches = pathMatchesGroup(loc, groupId);

  const hasBranding =
    meta.redeemSgTitle ||
    meta.redeemSgMetaDescription ||
    meta.redeemSgOgImage;

  const hasCdcContext = meta.cdcTitle || meta.voucherTitle;

  const hasWalletUi =
    dom.selectVoucherTypePage ||
    dom.selectVoucherTypeContainer ||
    dom.voucherGroupPage ||
    dom.qrShowView ||
    dom.qrCanvas ||
    dom.redemptionCard ||
    dom.voucherTile ||
    dom.redeemButton;

  const canCollect =
    hostnameOk && groupIdInPath && pathMatches;

  const isRedeemSgVoucherPage =
    canCollect &&
    (dom.reactRoot || hasBranding) &&
    (hasBranding || hasWalletUi || hasCdcContext || dom.reactRootPopulated);

  return {
    isRedeemSgVoucherPage,
    canCollect,
    groupId,
    signals: {
      hostname: hostnameOk,
      groupIdInPath,
      pathMatchesGroup: pathMatches,
      canCollect,
      ...meta,
      ...dom,
      hasBranding,
      hasCdcContext,
      hasWalletUi,
    },
  };
}
