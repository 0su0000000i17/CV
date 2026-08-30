import assert from "node:assert/strict";
import test from "node:test";

import { normalizeFinalCoverLetter } from "./normalize.js";

test("normalizes greeting and removes forbidden strict-tone filler", () => {
  const value = normalizeFinalCoverLetter(
    "Здравствуйте! Я уверен, что мои навыки будут полезны вашей команде. Буду рад обсудить опыт.",
    "strict_professional"
  );
  assert.equal(value.startsWith("Здравствуйте.\n\n"), true);
  assert.equal(value.includes("Я уверен"), false);
  assert.equal(value.includes("мои навыки будут полезны"), false);
  assert.match(value, /Готов обсудить/u);
});
