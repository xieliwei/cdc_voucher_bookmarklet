import assert from "node:assert/strict";
import { expiryLabel, formatExpiry } from "../src/print/format-expiry.js";

assert.equal(
  formatExpiry("2026-12-31T15:59:59.000Z", null),
  "31 Dec 2026",
);

assert.equal(formatExpiry(null, "31 Dec 2026"), "31 Dec 2026");

assert.equal(formatExpiry(null, null), null);

assert.equal(
  expiryLabel("31 Dec 2026", "Valid until"),
  "Valid until 31 Dec 2026",
);

assert.equal(expiryLabel(null), "");

console.log("print-format-expiry.test.mjs: all passed");
