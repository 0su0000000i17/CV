type DraftExperienceItem = {
  company?: string | null;
  position?: string | null;
  dates?: string | null;
  focus?: string | null;
  adaptedBullets?: string[];
  description?: string | null;
};

type DraftResume = {
  headline?: string | null;
  summary?: string | null;
  skills?: {
    primary?: string[];
    secondary?: string[];
  };
  experience?: DraftExperienceItem[];
  education?: {
    notes?: string[];
  };
  additionalInfo?: string[];
};

type EditableResumeDraft = {
  adaptedResume?: DraftResume;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function line(label: string, value?: string | null) {
  return value?.trim() ? `${label}: ${value.trim()}` : "";
}

/**
 * Renders the editable resume draft (the shape saved by the resume editor
 * after AI adaptation/improvement or manual edits) back into plain markdown,
 * so downstream analysis always reflects the current saved state instead of
 * the text extracted from the originally uploaded file.
 */
export function renderDraftMarkdown(resumeJson: unknown): string {
  if (!isRecord(resumeJson)) return "";

  const draft = (isRecord(resumeJson.adaptedResume)
    ? resumeJson.adaptedResume
    : resumeJson) as DraftResume;

  const sections: string[] = [];

  if (draft.headline?.trim()) sections.push(`# ${draft.headline.trim()}`);
  if (draft.summary?.trim()) sections.push(draft.summary.trim());

  const experience = Array.isArray(draft.experience) ? draft.experience : [];
  if (experience.length) {
    const experienceLines = experience.map((item) => {
      const header = [item.position, item.company, item.dates]
        .map((value) => value?.trim())
        .filter(Boolean)
        .join(" — ");

      // `description` is the free-text block the editor's textarea saves
      // back (applyEditableToSourceDocument re-parses it into the canonical
      // structural blocks on every save) - it's the freshest representation
      // and the only one that carries stack/paragraph/section-title lines
      // alongside bullets. `adaptedBullets`/`focus` are a fallback for
      // payload shapes without it; once `description` exists they can go
      // stale relative to it (e.g. after a manual edit to the textarea), so
      // they must never be used alongside it.
      const body = item.description?.trim()
        ? item.description.trim()
        : [
            item.focus?.trim(),
            ...(item.adaptedBullets || [])
              .map((bullet) => bullet?.trim())
              .filter(Boolean)
              .map((bullet) => `- ${bullet}`),
          ]
            .filter(Boolean)
            .join("\n");

      return [header && `## ${header}`, body].filter(Boolean).join("\n");
    });

    sections.push(["## Опыт работы", ...experienceLines].join("\n\n"));
  }

  const primarySkills = draft.skills?.primary || [];
  const secondarySkills = draft.skills?.secondary || [];
  const skills = [...primarySkills, ...secondarySkills].filter(Boolean);
  if (skills.length) sections.push(`## Навыки\n${skills.join(", ")}`);

  const educationNotes = (draft.education?.notes || []).filter(Boolean);
  if (educationNotes.length) sections.push(`## Образование\n${educationNotes.join("\n")}`);

  const additionalInfo = (draft.additionalInfo || []).filter(Boolean);
  if (additionalInfo.length) sections.push(`## Дополнительная информация\n${additionalInfo.join("\n")}`);

  return sections.filter(Boolean).join("\n\n").trim();
}
