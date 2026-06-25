import { extractEditableResumeWithAi } from "./ai-editable-resume-extractor.js";
import { parseContacts } from "./contacts-parser.js";
import { splitResumeIntoSections } from "./sections.js";
import type { EditableResumeContacts, EditableResumeJson } from "./types.js";

export type EditableResumeExtractionResult = {
  contacts: EditableResumeContacts;
  resumeJson: EditableResumeJson;
  extractor: {
    mode: "ai" | "local_fallback";
    provider: string | null;
    model: string | null;
  };
};

export async function extractEditableResume(
  markdown: string
): Promise<EditableResumeExtractionResult> {
  const sections = splitResumeIntoSections(markdown);
  const contacts = parseContacts(sections.header);

  try {
    const aiResult = await extractEditableResumeWithAi(markdown);

    return {
      contacts,
      resumeJson: aiResult.resume,
      extractor: {
        mode: "ai",
        provider: aiResult.generation.provider,
        model: aiResult.generation.model,
      },
    };
  } catch (error) {
    console.error("[editableResume] AI extraction failed", error);

    return {
      contacts,
      resumeJson: createFallbackResume(markdown),
      extractor: {
        mode: "local_fallback",
        provider: null,
        model: null,
      },
    };
  }
}

function createFallbackResume(markdown: string): EditableResumeJson {
  const sections = splitResumeIntoSections(markdown);
  const headline = findHeadline(sections.target) || "Резюме";

  return {
    target: {
      title: headline,
      company: null,
      seniority: null,
      keywordsUsed: [],
    },
    adaptedResume: {
      headline,
      summary: sections.additionalInfo.join("\n"),
      skills: {
        primary: sections.skills,
        secondary: [],
        deprioritized: [],
        notAdded: [],
      },
      experience: [],
      education: {
        policy: sections.education.length ? "unchanged" : "not_found",
        notes: dedupe(sections.education),
      },
      additionalInfo: sections.additionalInfo,
    },
    changes: [],
    warnings: ["Профессиональные блоки не удалось структурировать автоматически."],
    forbiddenClaims: [],
  };
}

function findHeadline(lines: string[]) {
  return (
    lines.find((line) => {
      return (
        !line.startsWith("Специализации:") &&
        !line.startsWith("—") &&
        !line.startsWith("Тип занятости:") &&
        !line.startsWith("Формат работы:") &&
        !line.startsWith("Желательное время")
      );
    }) ?? null
  );
}

function dedupe(items: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const key = item.toLowerCase();

    if (seen.has(key)) continue;

    seen.add(key);
    result.push(item);
  }

  return result;
}
