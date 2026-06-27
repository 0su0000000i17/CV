import type { EditableResumeJson } from "./types.js";

export type AiEditableResumeResult = {
  resume: EditableResumeJson;
  generation: {
    provider: string;
    model: string;
  };
};

export async function extractEditableResumeWithAi(): Promise<AiEditableResumeResult> {
  throw new Error("Legacy editable resume AI extractor is disabled. Use parseSourceResumeDocument instead.");
}
