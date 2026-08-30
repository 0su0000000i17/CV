import assert from "node:assert/strict";
import test from "node:test";

import { dedupeSkillNames } from "../skills-canonicalization.js";

test("removes spelling aliases and a generic API tag when a specific API is present", () => {
  assert.deepEqual(
    dedupeSkillNames([
      "SCSS",
      "Sass",
      "API",
      "REST API",
      "JavaScript",
      "JS",
      "React-hook-form",
      "React Hook Form",
    ]),
    ["SCSS", "REST API", "JavaScript", "React Hook Form"]
  );
});
