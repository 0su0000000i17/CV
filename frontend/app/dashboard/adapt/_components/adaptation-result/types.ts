import type { Dispatch, SetStateAction } from 'react';

import type {
  ResumeAdaptationResponse,
  ResumeAdaptationResult,
} from '@/src/shared/api/resume-adaptation';
import type {
  ResumeProfileExtractionResponse,
  UploadedResume,
} from '@/src/shared/api/resumes';

export type AdaptationResultCardProps = {
  adaptationResponse?: ResumeAdaptationResponse;
  profileExtraction?: ResumeProfileExtractionResponse;
  sourceResume?: UploadedResume;
  isAdapting: boolean;
  isError: boolean;
  isProfileLoading: boolean;
  errorMessage?: string;
  onResetAdaptation: () => void;
};

export type ContactDraft = {
  fullName: string;
  gender: string;
  age: string;
  birthDate: string;
  phone: string;
  email: string;
  city: string;
  citizenship: string;
  workPermit: string;
  relocation: string;
  businessTrips: string;
};

export type DraftUpdater = (
  updater: (current: ResumeAdaptationResult) => void
) => void;

export type ContactDraftSetter = Dispatch<SetStateAction<ContactDraft>>;