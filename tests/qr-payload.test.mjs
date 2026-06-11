import assert from "node:assert/strict";
import { buildSingleVoucherQrPayload } from "../src/qr.js";

assert.equal(
  buildSingleVoucherQrPayload({ voucherId: "v_abc123", extraQrPrefix: null }),
  "rsg:v_abc123",
);

assert.equal(
  buildSingleVoucherQrPayload({
    voucherId: "v_abc123",
    extraQrPrefix: "cfhp",
  }),
  "rsg-cfhp:v_abc123",
);

assert.equal(
  buildSingleVoucherQrPayload({
    voucherId: "v_abc123",
    extraQrPrefix: null,
    alias: "ALIAS00000000001",
  }),
  "rsg:ALIAS00000000001",
);

assert.equal(
  buildSingleVoucherQrPayload({
    voucherId: "v_ignored",
    extraQrPrefix: "cfhp",
    alias: "ALIAS00000000002",
  }),
  "rsg-cfhp:ALIAS00000000002",
);

console.log("qr-payload.test.mjs: all passed");
