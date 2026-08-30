import assert from "node:assert/strict";
import test from "node:test";

import {
  removeCompoundSkillFragments,
  splitPdfSkillTags,
} from "./skill-tags.js";

test("keeps multi-word and slash-based technology names intact", () => {
  assert.deepEqual(splitPdfSkillTags("React Hook Form"), ["React Hook Form"]);
  assert.deepEqual(splitPdfSkillTags("shadcn/ui"), ["shadcn/ui"]);
});

test("splits only explicit packed-skill delimiters", () => {
  assert.deepEqual(splitPdfSkillTags("React, TypeScript; Next.js"), [
    "React",
    "TypeScript",
    "Next.js",
  ]);
});

test("drops standalone fragments when the complete slash skill is present", () => {
  assert.deepEqual(
    removeCompoundSkillFragments(["shadcn/ui", "shadcn", "ui", "React"]),
    ["shadcn/ui", "React"],
  );
});
