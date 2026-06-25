import { AdaptationResultCard } from '@/src/features/resume-editor/adaptation-result-card';

import type { ResumeAdaptationResponse } from '@/src/shared/api/resume-adaptation';
import type {
  ResumeProfileExtractionResponse,
  UploadedResume,
} from '@/src/shared/api/resumes';

type Props = {
  adaptationResponse?: ResumeAdaptationResponse;
  profileExtraction?: ResumeProfileExtractionResponse;
  sourceResume?: UploadedResume;
  accessToken?: string | null;
  vacancyText: string;
  isAdapting: boolean;
  isError: boolean;
  isProfileLoading: boolean;
  error: unknown;
  onResetAdaptation: () => void;
};

export function GeneratedResumeWorkspace({
  adaptationResponse,
  profileExtraction,
  sourceResume,
  accessToken,
  vacancyText,
  isAdapting,
  isError,
  isProfileLoading,
  error,
  onResetAdaptation,
}: Props) {
  return (
    <AdaptationResultCard
      adaptationResponse={adaptationResponse}
      profileExtraction={profileExtraction}
      sourceResume={sourceResume}
      accessToken={accessToken}
      vacancyText={vacancyText}
      isAdapting={isAdapting}
      isError={isError}
      isProfileLoading={isProfileLoading}
      errorMessage={error instanceof Error ? error.message : undefined}
      onResetAdaptation={onResetAdaptation}
    />
  );
}