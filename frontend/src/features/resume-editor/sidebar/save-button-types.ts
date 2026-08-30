import type { AdaptedResumeExportContacts } from '@/src/shared/api/adapted-resume-export';
import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';
import type { UploadedResume } from '@/src/shared/api/resumes';

export type ResumeSaveButtonProps = {
  draft: ResumeAdaptationResult;
  contacts: AdaptedResumeExportContacts;
  photoUrl: string | null;
  sourceResume?: UploadedResume;
  accessToken?: string | null;
  vacancyText: string;
  onSaved?: () => void;
};
