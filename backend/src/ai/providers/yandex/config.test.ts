import assert from "node:assert/strict";
import test from "node:test";
import { getCompletionMode } from "./config.js";

test("uses low-latency synchronous generation unless economy mode is explicit", () => {
  assert.equal(getCompletionMode(undefined), "sync");
  assert.equal(getCompletionMode("sync"), "sync");
  assert.equal(getCompletionMode("invalid"), "sync");
  assert.equal(getCompletionMode(" ASYNC "), "async");
});
