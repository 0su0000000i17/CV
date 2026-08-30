import type { SourceExperienceItem } from "./types.js";

type SourceResumePayload = {
  experience?: {
    items?: Array<{
      sourceIndex?: number;
      company?: { name?: string | null };
      blocks?: Array<{ type?: string; text?: string | null }>;
    }>;
  };
};

export function parseSourceExperience(resumeJson: string): SourceExperienceItem[] {
  try {
    const parsed = JSON.parse(resumeJson) as SourceResumePayload;
    return (parsed.experience?.items || []).map((item, index) => ({
      sourceIndex: typeof item.sourceIndex === "number" ? item.sourceIndex : index,
      company: item.company?.name?.trim() || null,
      bullets: (item.blocks || [])
        .filter((block) => block.type === "bullet" && block.text)
        .map((block) => block.text?.trim() || "")
        .filter(Boolean),
    }));
  } catch {
    return [];
  }
}
