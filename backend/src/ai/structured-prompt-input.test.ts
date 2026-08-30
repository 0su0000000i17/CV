import assert from "node:assert/strict";
import test from "node:test";

import { prepareStructuredPromptInput } from "./structured-prompt-input.js";

test("compacts oversized JSON without dropping fields", () => {
  const source = JSON.stringify(
    { summary: "Полный текст", skills: ["React", "TypeScript"] },
    null,
    2,
  );
  const result = prepareStructuredPromptInput(source, source.length - 1);

  assert.deepEqual(JSON.parse(result), JSON.parse(source));
  assert.ok(result.length < source.length);
});

test("preserves valid JSON when even the compact form exceeds the soft limit", () => {
  const source = JSON.stringify({ summary: "длинный подтверждённый текст" });
  const result = prepareStructuredPromptInput(source, 12);

  assert.deepEqual(JSON.parse(result), JSON.parse(source));
  assert.ok(result.length > 12);
});

test("keeps the legacy character guard for unstructured input", () => {
  assert.equal(prepareStructuredPromptInput("abcdefgh", 5), "abcde");
});
