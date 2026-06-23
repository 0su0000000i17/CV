import type { Dispatch, SetStateAction } from 'react';

import type {
  ResumeAdaptationResponse,
  ResumeAdaptationResult,
} from '@/src/shared/api/resume-adaptation';

export type AdaptationResultCardProps = {
  adaptationResponse?: ResumeAdaptationResponse;
  isAdapting: boolean;
  isError: boolean;
  errorMessage?: string;
  onResetAdaptation: () => void;
};

export type ContactDraft = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
};

export type DraftUpdater = (
  updater: (current: ResumeAdaptationResult) => void
) => void;

export type ContactDraftSetter = Dispatch<SetStateAction<ContactDraft>>;
