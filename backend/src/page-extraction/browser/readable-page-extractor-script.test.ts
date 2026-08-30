import assert from "node:assert/strict";
import test from "node:test";
import { READABLE_PAGE_EXTRACTOR_SCRIPT } from "./readable-page-extractor-script.js";

test("browser vacancy extractor remains valid JavaScript", () => {
  assert.doesNotThrow(() => new Function(READABLE_PAGE_EXTRACTOR_SCRIPT));
  assert.match(READABLE_PAGE_EXTRACTOR_SCRIPT, /JobPosting/u);
});
