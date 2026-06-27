import type {
  ResumeTextBlock,
  SourceResumeDocument,
} from "../resume-document/types.js";

export type ResumeAdaptationAiPayload = ReturnType<typeof buildResumeAdaptationAiPayload>;

export function buildResumeAdaptationAiPayload(document: SourceResumeDocument) {
  return {
    target: {
      title: document.target.title,
      salary: document.target.salary,
      specializations: document.target.specializations,
      employment: document.target.employment,
      schedule: document.target.schedule,
      workFormat: document.target.workFormat,
      commuteTime: document.target.commuteTime,
    },
    experience: {
      total: document.experience.total,
      items: document.experience.items.map((item) => ({
        id: item.id,
        sourceIndex: item.sourceIndex,
        dates: {
          start: item.dates.start,
          end: item.dates.end,
          duration: item.dates.duration,
        },
        company: {
          name: item.company.name,
          industries: item.company.industries,
        },
        position: item.position,
        blocks: sanitizeBlocks(item.blocks),
      })),
    },
    education: {
      level: document.education.level,
      items: document.education.items.map((item) => ({
        id: item.id,
        year: item.year,
        institution: item.institution,
        faculty: item.faculty,
        specialization: item.specialization,
      })),
    },
    skills: {
      languages: document.skills.languages.map((item) => ({
        name: item.name,
        level: item.level,
        description: item.description,
      })),
      items: document.skills.items,
    },
    additional: {
      about: document.additional.about,
    },
  };
}

export function stringifyResumeAdaptationAiPayload(document: SourceResumeDocument) {
  return JSON.stringify(buildResumeAdaptationAiPayload(document), null, 2);
}

function sanitizeBlocks(blocks: ResumeTextBlock[]) {
  return blocks.map((block) => {
    if (block.type === "stack") {
      return {
        id: block.id,
        type: block.type,
        label: block.label,
        items: block.items,
      };
    }

    if (block.type === "sectionTitle") {
      return {
        id: block.id,
        type: block.type,
        title: block.title,
      };
    }

    return {
      id: block.id,
      type: block.type,
      text: block.text,
    };
  });
}
