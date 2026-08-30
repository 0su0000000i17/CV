export type ResumeQuestionExperience = {
  sourceIndex: number;
  company: string | null;
  position: string | null;
  claims: string[];
};

export type ResumeQuestionContext = {
  targetTitle: string | null;
  experiences: ResumeQuestionExperience[];
};

type ResumePayload = {
  target?: { title?: unknown };
  experience?: {
    items?: Array<{
      sourceIndex?: unknown;
      company?: { name?: unknown };
      position?: unknown;
      blocks?: Array<{ type?: unknown; text?: unknown }>;
    }>;
  };
};

function clean(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.replace(/\s+/gu, " ").trim().slice(0, maxLength) || null
    : null;
}

export function readResumeQuestionContext(resumeJson: string): ResumeQuestionContext {
  try {
    const parsed = JSON.parse(resumeJson) as ResumePayload;
    const experiences = (parsed.experience?.items || []).map((item, index) => ({
      sourceIndex: typeof item.sourceIndex === "number" && Number.isInteger(item.sourceIndex)
        ? item.sourceIndex : index,
      company: clean(item.company?.name, 100),
      position: clean(item.position, 100),
      claims: (item.blocks || [])
        .filter((block) => block.type === "bullet" || block.type === "paragraph")
        .map((block) => clean(block.text, 500))
        .filter((text): text is string => Boolean(text)),
    }));
    return { targetTitle: clean(parsed.target?.title, 120), experiences };
  } catch {
    return { targetTitle: null, experiences: [] };
  }
}
