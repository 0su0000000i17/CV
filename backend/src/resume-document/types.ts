import type {
  SourceResumeAdditional,
  SourceResumeCourses,
  SourceResumeDiagnostics,
  SourceResumeEducation,
  SourceResumeSkills,
} from "./source-resume-background.js";
import type {
  SourceResumeDocumentSource,
  SourceResumeMeta,
  SourceResumePersonal,
  SourceResumePhoto,
  SourceResumeTarget,
} from "./source-resume-core.js";
import type { SourceResumeExperience } from "./source-resume-experience.js";

export const SOURCE_RESUME_DOCUMENT_VERSION = 3 as const;

export type { ResumeTextBlock } from "./resume-text-block.js";

export type SourceResumeDocument = {
  version: typeof SOURCE_RESUME_DOCUMENT_VERSION;
  source: SourceResumeDocumentSource;
  photo?: SourceResumePhoto | null;
  meta: SourceResumeMeta;
  personal: SourceResumePersonal;
  target: SourceResumeTarget;
  experience: SourceResumeExperience;
  education: SourceResumeEducation;
  courses: SourceResumeCourses;
  skills: SourceResumeSkills;
  additional: SourceResumeAdditional;
  diagnostics: SourceResumeDiagnostics;
};
