import { analyzeResumeCalibrationPrompt } from "./analyze-resume-calibration-prompt.js";
import { analyzeResumeCorePrompt } from "./analyze-resume-core-prompt.js";
import { analyzeResumeFlagsPrompt } from "./analyze-resume-flags-prompt.js";

export const analyzeResumeSystemPrompt = [
  analyzeResumeCorePrompt,
  analyzeResumeCalibrationPrompt,
  analyzeResumeFlagsPrompt,
].join("\n\n");

export {
  createAnalyzeResumeUserPrompt,
  type PreviousResumeAssessment,
} from "./analyze-resume-user-prompt.js";
