import { StagedLoadingState } from '@/src/shared/ui/staged-loading-state';

import { analysisLoadingSteps, analysisLongWaitSteps } from './analysis-loading-steps';

export function AnalysisLoadingState() {
  return (
    <StagedLoadingState
      heading="Анализируем резюме"
      steps={analysisLoadingSteps}
      longWaitSteps={analysisLongWaitSteps}
    />
  );
}
