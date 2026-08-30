import type {
  ResumeAdaptationResponse,
  ResumeAdaptationResult,
} from '@/src/shared/api/resume-adaptation';
import type {
  ResumeProfileExtractionResponse,
  UploadedResume,
} from '@/src/shared/api/resumes';
import type { LoadingStep } from '@/src/shared/ui/staged-loading-state';

export type AdaptationResultCardProps = {
  adaptationResponse?: ResumeAdaptationResponse;
  profileExtraction?: ResumeProfileExtractionResponse;
  sourceResume?: UploadedResume;
  accessToken?: string | null;
  vacancyText: string;
  isAdapting: boolean;
  isError: boolean;
  isProfileLoading: boolean;
  errorMessage?: string;
  loadingTitle?: string;
  loadingSteps?: LoadingStep[];
  loadingLongWaitSteps?: LoadingStep[];
  errorTitle?: string;
  sidebarTitle?: string;
  sidebarDescription?: string;
  resetButtonLabel?: string;
  resetButtonVisible?: boolean;
  coverLetterEnabled?: boolean;
  replaceProfileEnabled?: boolean;
  onProfileReplaced?: () => void;
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
