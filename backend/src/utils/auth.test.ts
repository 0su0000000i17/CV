import assert from "node:assert/strict";
import test from "node:test";

import { parseBearerToken } from "./bearer-token.js";

test("parseBearerToken accepts one strict bearer credential", () => {
  assert.equal(
    parseBearerToken("Bearer abcdefghijklmnop.qrstuvwxyz012345.6789_-token"),
    "abcdefghijklmnop.qrstuvwxyz012345.6789_-token"
  );
});

test("parseBearerToken rejects ambiguous or malformed authorization headers", () => {
  assert.equal(parseBearerToken("Basic abcdefghijklmnop"), null);
  assert.equal(parseBearerToken("prefix Bearer abcdefghijklmnop"), null);
  assert.equal(parseBearerToken("Bearer abcdefghijklmnop, Basic another"), null);
  assert.equal(parseBearerToken("Bearer short"), null);
});
