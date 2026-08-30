import { extractorScriptHelpers } from "./extractor-script-helpers.js";
import { extractorScriptLayout } from "./extractor-script-layout.js";
import { extractorScriptRunner } from "./extractor-script-runner.js";

export const extractorScript = [
  extractorScriptHelpers,
  extractorScriptLayout,
  extractorScriptRunner,
].join("\n");
