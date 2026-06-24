import { AdaptationResultCard } from './adaptation-result-card';

import type { ResumeAdaptationResponse } from '@/src/shared/api/resume-adaptation';
import type {
  ResumeProfileExtractionResponse,
  UploadedResume,
} from '@/src/shared/api/resumes';

type Props = {
  adaptationResponse?: ResumeAdaptationResponse;
  profileExtraction?: ResumeProfileExtractionResponse;
  sourceResume?: UploadedResume;
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
      isAdapting={isAdapting}
      isError={isError}
      isProfileLoading={isProfileLoading}
      errorMessage={error instanceof Error ? error.message : undefined}
      onResetAdaptation={onResetAdaptation}
    />
  );
}