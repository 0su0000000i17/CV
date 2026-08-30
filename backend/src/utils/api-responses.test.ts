import assert from "node:assert/strict";
import test from "node:test";

import { getSafeErrorMessage } from "./api-responses.js";

test("safe errors redact AI payloads and credentials", () => {
  const message = getSafeErrorMessage(
    new Error(
      'Invalid JSON. Raw response: {"resume":"personal data"}\n' +
        "access_token=secret-value"
    )
  );

  assert.equal(message, "Invalid JSON. Raw response: [redacted]");
  assert.doesNotMatch(message, /personal data|secret-value/u);
});

test("safe errors are single-line and bounded", () => {
  const message = getSafeErrorMessage(`Failure\n${"x".repeat(2_000)}`);

  assert.equal(message.includes("\n"), false);
  assert.ok(message.length <= 801);
});
