import { AdaptSetupWorkspace } from './adapt-setup-workspace';
import { GeneratedResumeWorkspace } from './generated-resume-workspace';
import type { AdaptPageModel } from '../_hooks/use-adapt-page-model';
import type { useAdaptPageActions } from '../_hooks/use-adapt-page-actions';
import { getVacancyInputKind } from '../_lib/adapt-page-utils';
import { ClarifyingQuestionsCard } from '@/src/shared/ui/clarifying-questions-card';
import { StagedLoadingState } from '@/src/shared/ui/staged-loading-state';

const loadingSteps = [
  { title: 'Сверяем требования вакансии с резюме',
    description: 'Ищем требования, которых нет в резюме, но которые вы можете закрыть честно.' },
  { title: 'Готовим уточняющие вопросы',
    description: 'Каждый подтверждённый ответ поднимет совпадение с вакансией.' },
];

export function AdaptPageContent(props: {
  model: AdaptPageModel;
  actions: ReturnType<typeof useAdaptPageActions>;
  currentProfile: AdaptPageModel['resumeProfileMutation']['data'];
  isProfileLoading: boolean;
}) {
  const { model, actions } = props;
  const adapting = model.resumeAdaptationMutation.isPending;
  if (!model.hasAdaptationWorkspace && model.adaptationQuestionsMutation.isPending) {
    return <StagedLoadingState heading="Готовим вопросы по вакансии" steps={loadingSteps}
      longWaitSteps={[{ title: 'Почти готово', description: 'Собираем вопросы в один список.' }]} />;
  }
  if (!model.hasAdaptationWorkspace && model.questionsSession) {
    return <ClarifyingQuestionsCard session={model.questionsSession}
      isSubmitting={model.submitAdaptationAnswersMutation.isPending || adapting}
      description="В вакансии есть требования, которых нет в резюме. Подтвердите то, чем реально владеете, — это честно поднимет совпадение с вакансией."
      skipWarning="Без ответов адаптация не сможет закрыть пробелы по требованиям вакансии — совпадение вырастет меньше."
      submitLabel="Адаптировать резюме" onSubmit={actions.submitAnswers}
      onSkip={actions.skipQuestions} />;
  }
  if (model.hasAdaptationWorkspace) {
    return <GeneratedResumeWorkspace adaptationResponse={model.adaptationResponse}
      profileExtraction={props.currentProfile} sourceResume={model.selectedResume}
      accessToken={model.accessToken} vacancyText={model.vacancyState.preparedVacancyText || model.vacancyState.vacancyInput}
      vacancy={model.vacancyState.preparedVacancy} vacancyInput={model.vacancyState.vacancyInput}
      isAdapting={adapting} isError={model.resumeAdaptationMutation.isError}
      isProfileLoading={props.isProfileLoading} error={model.resumeAdaptationMutation.error}
      onResetAdaptation={model.resetAdaptationOnly} />;
  }
  return <AdaptSetupWorkspace selectedResume={model.selectedResume} resumes={model.resumes}
    isResumesLoading={false} isResumesError={model.resumesQuery.isError}
    vacancyInput={model.vacancyState.vacancyInput}
    vacancyInputKind={getVacancyInputKind(model.vacancyState.vacancyInput)}
    preparedVacancyTextLength={model.vacancyState.preparedVacancyText.length}
    extractionStatus={model.vacancyState.extractionStatus}
    extractionMessage={model.vacancyState.extractionMessage} fitResponse={model.fitResponse}
    adaptationResponse={model.adaptationResponse} isPreparing={model.prepareVacancyMutation.isPending}
    isCheckingFit={model.resumeVacancyFitMutation.isPending} isAdapting={adapting}
    isFitError={model.resumeVacancyFitMutation.isError}
    fitErrorMessage={model.resumeVacancyFitMutation.error instanceof Error ? model.resumeVacancyFitMutation.error.message : undefined}
    onSelectResume={actions.selectResume} onVacancyInputChange={model.vacancyState.handleVacancyInputChange}
    onPrepareVacancy={actions.prepareVacancy} onCreateAdaptation={actions.createAdaptation}
    onChooseAnotherVacancy={() => model.vacancyState.handleVacancyInputChange('')} />;
}
