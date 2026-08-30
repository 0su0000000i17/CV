import { AdaptationResultCard } from '@/src/features/resume-editor/adaptation/result-card';
import type { ResumeAdaptationResponse } from '@/src/shared/api/resume-improvement';
import type { ResumeProfileExtractionResponse, UploadedResume } from '@/src/shared/api/resumes';
import { improveLoadingSteps, improveLongWaitSteps } from '../_lib/improve-loading-steps';
import { ImproveResultBanner } from './improve-result-banner';

export function ImproveWorkspace(props: {
  response?: ResumeAdaptationResponse;
  profile?: ResumeProfileExtractionResponse;
  resume?: UploadedResume;
  accessToken: string;
  isPending: boolean;
  isError: boolean;
  isProfileLoading: boolean;
  error?: unknown;
  saved: boolean;
  canReset: boolean;
  onSaved: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-5">
      {props.response ? <ImproveResultBanner saved={props.saved} resumeId={props.resume?.id} /> : null}
      <AdaptationResultCard
        adaptationResponse={props.response}
        profileExtraction={props.profile}
        sourceResume={props.resume}
        accessToken={props.accessToken}
        vacancyText=""
        isAdapting={props.isPending}
        isError={props.isError}
        isProfileLoading={props.isProfileLoading}
        errorMessage={props.error instanceof Error ? props.error.message : undefined}
        loadingTitle="Улучшаем резюме"
        loadingSteps={improveLoadingSteps}
        loadingLongWaitSteps={improveLongWaitSteps}
        errorTitle="Не удалось улучшить резюме"
        sidebarTitle="Редактор улучшенного резюме"
        sidebarDescription="Проверьте текст и сохраните улучшение в профиль перед повторной оценкой."
        resetButtonLabel="Улучшить другое резюме"
        resetButtonVisible={props.canReset}
        coverLetterEnabled={false}
        replaceProfileEnabled
        onProfileReplaced={props.onSaved}
        onResetAdaptation={props.onReset}
      />
    </div>
  );
}
