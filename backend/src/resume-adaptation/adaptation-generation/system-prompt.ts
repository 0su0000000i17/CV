import { ADAPTATION_SYSTEM_PRINCIPLES } from "./system-prompt-principles.js";
import { ADAPTATION_SYSTEM_RULES } from "./system-prompt-rules.js";

export const SYSTEM_PROMPT = [
  ADAPTATION_SYSTEM_PRINCIPLES,
  ADAPTATION_SYSTEM_RULES,
].join("\n\n");
