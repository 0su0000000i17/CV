import assert from "node:assert/strict";
import test from "node:test";
import { createCompletionPayload } from "./completion.js";
import { createHeaders } from "./http.js";
import type { YandexConfig } from "./types.js";

const config: YandexConfig = {
  apiKey: "test-key",
  folderId: "test-folder",
  liteModel: "lite",
  proModel: "pro",
  completionMode: "sync",
  syncCompletionUrl: "https://example.test/completion",
  asyncCompletionUrl: "https://example.test/completionAsync",
  operationBaseUrl: "https://example.test/operations",
  timeoutMs: 1_000,
  pollIntervalMs: 500,
  enableServerDataLogging: false,
};

test("disables provider-side request logging through the documented REST header", () => {
  const headers = createHeaders(config);

  assert.equal(headers["x-data-logging-enabled"], "false");
  assert.equal(headers["x-folder-id"], "test-folder");
});

test("uses the supported JSON response field without undocumented body flags", () => {
  const payload = createCompletionPayload(config, {
    messages: [{ role: "user", content: "Return JSON" }],
    jsonObject: true,
  }, "lite") as Record<string, unknown>;

  assert.equal(payload.jsonObject, true);
  assert.equal("enable_server_data_logging" in payload, false);
});
