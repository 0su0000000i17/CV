import assert from "node:assert/strict";
import test from "node:test";

import { searchJobRoles } from "./job-role-suggestions.js";

test("role suggestions are normalized, deduplicated, and cached", async () => {
  const originalFetch = globalThis.fetch;
  let requestCount = 0;

  globalThis.fetch = async (input) => {
    requestCount += 1;
    const url = new URL(String(input));
    assert.equal(url.pathname, "/suggests/vacancy_positions");
    assert.match(url.searchParams.get("text") || "", /^role-suggest-test-/u);
    return Response.json({
      items: [
        { id: "1", text: "  Product analyst  " },
        { id: "2", text: "Product analyst" },
        { id: "3", text: "Product manager" },
        { id: "4", text: "" },
      ],
    });
  };

  try {
    const query = `role-suggest-test-${Date.now()}`;
    const first = await searchJobRoles(query);
    const second = await searchJobRoles(query);

    assert.deepEqual(first, [
      { id: "1", text: "Product analyst" },
      { id: "3", text: "Product manager" },
    ]);
    assert.deepEqual(second, first);
    assert.equal(requestCount, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
