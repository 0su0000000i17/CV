'use client';

import { useEffect, useState } from 'react';

import type { ImproveSessionState } from './use-improve-session-state';
import { useResumeImprovementMutation } from '@/src/shared/hooks/use-resume-improvement-mutation';
import { useResumeProfileExtractionMutation } from '@/src/shared/hooks/use-resume-profile-extraction-mutation';

export function useImprovementProfile(params: {
  accessToken: string | null | undefined;
  resumeId?: string;
  savedState: ImproveSessionState | null;
  saveState: (value: ImproveSessionState) => void;
  clearState: () => void;
}) {
  const { accessToken, clearState, resumeId, savedState, saveState } = params;
  const improvement = useResumeImprovementMutation();
  const profile = useResumeProfileExtractionMutation();
  const [activeResumeId, setActiveResumeId] = useState<string | null>(
    () => savedState?.activeImprovementResumeId ?? null,
  );
  const [isSaved, setIsSaved] = useState(false);
  const savedResponse = savedState?.improvementResponse;
  const response = improvement.data
    ?? (savedResponse?.resumeId === resumeId ? savedResponse : undefined);
  const isCurrent = Boolean(resumeId) && activeResumeId === resumeId;
  const adaptation = isCurrent && response?.resumeId === resumeId ? response : undefined;
  const savedProfile = savedState?.profileExtraction;
  const profileExtraction = profile.data?.resumeId === resumeId
    ? profile.data
    : savedProfile?.resumeId === resumeId ? savedProfile : undefined;

  useEffect(() => {
    if (!resumeId || !adaptation) return;
    saveState({
      selectedResumeId: resumeId,
      activeImprovementResumeId: resumeId,
      improvementResponse: adaptation,
      profileExtraction,
    });
  }, [adaptation, profileExtraction, resumeId, saveState]);

  useEffect(() => {
    if (!accessToken || !resumeId || !adaptation) return;
    if (profile.isPending || profileExtraction) return;
    profile.mutate({ resumeId, accessToken });
  }, [accessToken, adaptation, profile, profileExtraction, resumeId]);

  function run(sessionId?: string) {
    if (!accessToken || !resumeId) return;
    improvement.reset();
    profile.reset();
    clearState();
    setIsSaved(false);
    setActiveResumeId(resumeId);
    improvement.mutate({ resumeId, accessToken, sessionId });
  }

  function reset() {
    setActiveResumeId(null);
    setIsSaved(false);
    improvement.reset();
    profile.reset();
    clearState();
  }

  return {
    improvement,
    adaptation,
    profileExtraction,
    isProfileLoading: Boolean(adaptation && resumeId && profile.isPending && !profileExtraction),
    hasWorkspace: Boolean(adaptation || (isCurrent && (improvement.isPending || improvement.isError))),
    isCurrent,
    isSaved,
    markSaved: () => setIsSaved(true),
    run,
    reset,
  };
}
