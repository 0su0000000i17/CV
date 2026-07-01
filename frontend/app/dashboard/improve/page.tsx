'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Wand2 } from 'lucide-react';

import { useDashboardResumeSelection } from '../_components/dashboard-resume-selection-provider';
import { useImproveSessionState } from './_hooks/use-improve-session-state';

import { AdaptationResultCard } from '@/src/features/resume-editor/adaptation/result-card';
import { ResumeSelectorCard } from '@/src/shared/ui/resume-selector-card';
import { useAuth } from '@/src/shared/hooks/use-auth';
import { useResumeImprovementMutation } from '@/src/shared/hooks/use-resume-improvement-mutation';
import { useResumeProfileExtractionMutation } from '@/src/shared/hooks/use-resume-profile-extraction-mutation';
import { useResumesQuery } from '@/src/shared/hooks/use-resumes-query';

function createImproveRoute(searchParamsString: string, resumeId: string) {
  const params = new URLSearchParams(searchParamsString);
  params.set('resumeId', resumeId);
  return `/dashboard/improve?${params.toString()}`;
}

export default function ImproveResumePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const resumeId = searchParams.get('resumeId');
  const { selectedResumeId, setSelectedResumeId } = useDashboardResumeSelection();
  const { accessToken } = useAuth();
  const { state: savedImproveState, saveState, clearState } = useImproveSessionState();
  const resumesQuery = useResumesQuery(accessToken);
  const improvementMutation = useResumeImprovementMutation();
  const profileMutation = useResumeProfileExtractionMutation();
  const [activeImprovementResumeId, setActiveImprovementResumeId] = useState<string | null>(
    () => savedImproveState?.activeImprovementResumeId ?? null
  );
  const resumes = resumesQuery.data?.resumes ?? [];

  const selectedResume = useMemo(() => {
    if (!resumes.length) return undefined;
    const ids = [resumeId, selectedResumeId, savedImproveState?.selectedResumeId].filter(
      (value): value is string => Boolean(value)
    );
    return ids.map((id) => resumes.find((resume) => resume.id === id)).find(Boolean) || resumes[0];
  }, [resumeId, resumes, savedImproveState?.selectedResumeId, selectedResumeId]);

  const restoredImprovementResponse =
    savedImproveState?.improvementResponse?.resumeId === selectedResume?.id
      ? savedImproveState.improvementResponse
      : undefined;
  const improvementResponse = improvementMutation.data ?? restoredImprovementResponse;
  const isCurrentImprovement =
    Boolean(selectedResume?.id) && activeImprovementResumeId === selectedResume?.id;
  const adaptationResponse =
    isCurrentImprovement && improvementResponse?.resumeId === selectedResume?.id
      ? improvementResponse
      : undefined;
  const restoredProfileExtraction =
    savedImproveState?.profileExtraction?.resumeId === selectedResume?.id
      ? savedImproveState.profileExtraction
      : undefined;
  const currentProfileExtraction =
    profileMutation.data?.resumeId === selectedResume?.id
      ? profileMutation.data
      : restoredProfileExtraction;
  const isProfileLoading =
    Boolean(adaptationResponse) && Boolean(selectedResume?.id) && profileMutation.isPending && !currentProfileExtraction;
  const hasWorkspace =
    Boolean(adaptationResponse) ||
    (isCurrentImprovement && improvementMutation.isPending) ||
    (isCurrentImprovement && improvementMutation.isError);

  useEffect(() => {
    if (!selectedResume?.id || selectedResumeId === selectedResume.id) return;
    setSelectedResumeId(selectedResume.id);
  }, [selectedResume?.id, selectedResumeId, setSelectedResumeId]);

  useEffect(() => {
    if (!selectedResume?.id || resumeId === selectedResume.id) return;
    router.replace(createImproveRoute(searchParamsString, selectedResume.id));
  }, [resumeId, router, searchParamsString, selectedResume?.id]);

  useEffect(() => {
    if (!selectedResume?.id || !adaptationResponse) return;
    saveState({
      selectedResumeId: selectedResume.id,
      activeImprovementResumeId: selectedResume.id,
      improvementResponse: adaptationResponse,
      profileExtraction: currentProfileExtraction,
    });
  }, [adaptationResponse, currentProfileExtraction, saveState, selectedResume?.id]);

  useEffect(() => {
    if (!accessToken || !selectedResume?.id || !adaptationResponse) return;
    if (profileMutation.isPending || currentProfileExtraction) return;
    profileMutation.mutate({ resumeId: selectedResume.id, accessToken });
  }, [accessToken, adaptationResponse, currentProfileExtraction, profileMutation, selectedResume?.id]);

  function resetResult() {
    setActiveImprovementResumeId(null);
    improvementMutation.reset();
    profileMutation.reset();
    clearState();
  }

  function handleSelectResume(nextResumeId: string) {
    setSelectedResumeId(nextResumeId);
    resetResult();
    router.replace(createImproveRoute(searchParamsString, nextResumeId));
  }

  function handleImproveResume() {
    if (!accessToken || !selectedResume?.id || improvementMutation.isPending) return;
    improvementMutation.reset();
    profileMutation.reset();
    clearState();
    setActiveImprovementResumeId(selectedResume.id);
    improvementMutation.mutate({ resumeId: selectedResume.id, accessToken });
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">Личный кабинет / Улучшение резюме</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Улучшение резюме
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Усилим формулировки, навыки и достижения без привязки к конкретной вакансии.
        </p>
      </section>

      {hasWorkspace ? (
        <AdaptationResultCard
          adaptationResponse={adaptationResponse}
          profileExtraction={currentProfileExtraction}
          sourceResume={selectedResume}
          accessToken={accessToken}
          vacancyText=""
          isAdapting={isCurrentImprovement && improvementMutation.isPending}
          isError={isCurrentImprovement && improvementMutation.isError}
          isProfileLoading={isProfileLoading}
          errorMessage={improvementMutation.error instanceof Error ? improvementMutation.error.message : undefined}
          sidebarTitle="Редактор улучшенного резюме"
          sidebarDescription="Проверьте черновик и сохраните готовый PDF."
          resetButtonLabel="Улучшить другое резюме"
          coverLetterEnabled={false}
          onResetAdaptation={resetResult}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <ResumeSelectorCard
            selectedResume={selectedResume}
            resumes={resumes}
            isLoading={resumesQuery.isPending}
            isError={resumesQuery.isError}
            onSelectResume={handleSelectResume}
            description="Этот файл будет улучшен без привязки к вакансии."
            modalDescription="Выбранный файл будет использован для улучшения резюме."
          />

          <aside className="rounded-2xl border border-border bg-card/60 p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-300 ring-1 ring-emerald-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-medium text-foreground">Что улучшится</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Опыт, summary, hard skills, ATS-ключи и измеримые результаты.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={!accessToken || !selectedResume || improvementMutation.isPending}
              onClick={handleImproveResume}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Wand2 className="h-4 w-4" />
              Улучшить резюме
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
