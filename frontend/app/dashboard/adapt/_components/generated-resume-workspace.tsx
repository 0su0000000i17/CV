import { AdaptationResultCard } from './adaptation-result-card';

import type { ResumeAdaptationResponse } from '@/src/shared/api/resume-adaptation';
import type { UploadedResume } from '@/src/shared/api/resumes';

type Props = {
  adaptationResponse?: ResumeAdaptationResponse;
  sourceResume?: UploadedResume;
  isAdapting: boolean;
  isError: boolean;
  error: unknown;
  onResetAdaptation: () => void;
};

export function GeneratedResumeWorkspace({
  adaptationResponse,
  sourceResume,
  isAdapting,
  isError,
  error,
  onResetAdaptation,
}: Props) {
  return (
    <AdaptationResultCard
      adaptationResponse={adaptationResponse}
      sourceResume={sourceResume}
      isAdapting={isAdapting}
      isError={isError}
      errorMessage={error instanceof Error ? error.message : undefined}
      onResetAdaptation={onResetAdaptation}
    />
  );
}