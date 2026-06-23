import type { Dispatch, SetStateAction } from 'react';

import type {
  ResumeAdaptationResponse,
  ResumeAdaptationResult,
} from '@/src/shared/api/resume-adaptation';
import type { UploadedResume } from '@/src/shared/api/resumes';

export type AdaptationResultCardProps = {
  adaptationResponse?: ResumeAdaptationResponse;
  sourceResume?: UploadedResume;
  isAdapting: boolean;
  isError: boolean;
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