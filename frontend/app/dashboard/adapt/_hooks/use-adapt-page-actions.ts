'use client';

import type { ClarifyingAnswer } from '@/src/shared/api/resume-improvement-questions';
import { createAdaptationFromFit, prepareVacancyForFit } from '../_lib/adapt-flow-actions';
import type { AdaptPageModel } from './use-adapt-page-model';

export function useAdaptPageActions(model: AdaptPageModel) {
  const runAdaptation = (sessionId?: string) => {
    model.setQuestionsSession(null);
    createAdaptationFromFit({
      accessToken: model.accessToken,
      selectedResumeId: model.selectedResume?.id,
      preparedVacancy: model.vacancyState.preparedVacancy,
      preparedVacancyText: model.vacancyState.preparedVacancyText,
      fitMutation: model.fitResponse
        ? { data: { fit: model.fitResponse.fit } }
        : model.resumeVacancyFitMutation,
      adaptationMutation: model.resumeAdaptationMutation,
      sessionId,
    });
  };
  const prepareVacancy = () => prepareVacancyForFit({
    vacancyInput: model.vacancyState.vacancyInput,
    accessToken: model.accessToken,
    selectedResumeId: model.selectedResume?.id,
    prepareMutation: model.prepareVacancyMutation,
    fitMutation: model.resumeVacancyFitMutation,
    adaptationMutation: model.resumeAdaptationMutation,
    statusSetters: model.vacancyState,
  });
  const createAdaptation = () => {
    const fit = model.fitResponse?.fit ?? model.resumeVacancyFitMutation.data?.fit;
    if (!model.accessToken || !model.selectedResume?.id ||
      !model.vacancyState.preparedVacancy || !fit?.canAdapt ||
      model.adaptationQuestionsMutation.isPending) return;
    model.adaptationQuestionsMutation.mutate({
      resumeId: model.selectedResume.id,
      vacancy: model.vacancyState.preparedVacancy,
      vacancyText: model.vacancyState.preparedVacancyText,
      fit,
      accessToken: model.accessToken,
    }, {
      onSuccess: (data) => data.session
        ? model.setQuestionsSession(data.session)
        : runAdaptation(),
      onError: () => runAdaptation(),
    });
  };
  const submitAnswers = (answers: ClarifyingAnswer[]) => {
    if (!model.accessToken || !model.selectedResume?.id || !model.questionsSession) return;
    model.submitAdaptationAnswersMutation.mutate({
      resumeId: model.selectedResume.id,
      sessionId: model.questionsSession.id,
      accessToken: model.accessToken,
      answers,
    }, { onSuccess: (data) => runAdaptation(data.session.id) });
  };
  const skipQuestions = () => {
    if (!model.accessToken || !model.selectedResume?.id || !model.questionsSession) return;
    model.submitAdaptationAnswersMutation.mutate({
      resumeId: model.selectedResume.id,
      sessionId: model.questionsSession.id,
      accessToken: model.accessToken,
      skipped: true,
    }, { onSuccess: () => runAdaptation() });
  };
  const selectResume = (id: string) => {
    model.vacancyState.handleVacancyInputChange('');
    model.handleSelectResume(id);
  };
  return { prepareVacancy, createAdaptation, submitAnswers, skipQuestions, selectResume };
}
