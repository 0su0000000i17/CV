import { useEffect, useRef, useState } from 'react';

const FIRST_ANALYSIS_MIN_LOADING_MS = 0;
const REPEAT_ANALYSIS_MIN_LOADING_MS = 25_000;

type ResumeAnalysisStatus = {
  analysis_status: string;
  last_score: number | null;
};

function isResumeAnalyzed(resume?: ResumeAnalysisStatus) {
  return Boolean(
    resume &&
      resume.analysis_status === 'completed' &&
      resume.last_score !== null
  );
}

export function getAnalyzeMinLoadingMs(resume?: ResumeAnalysisStatus) {
  return isResumeAnalyzed(resume)
    ? REPEAT_ANALYSIS_MIN_LOADING_MS
    : FIRST_ANALYSIS_MIN_LOADING_MS;
}

export function useSyntheticAnalyzeLoading() {
  const syntheticAnalyzeStartedAtRef = useRef<number | null>(null);
  const syntheticAnalyzeTimeoutRef = useRef<number | null>(null);
  const activeAnalyzeMinLoadingMsRef = useRef(FIRST_ANALYSIS_MIN_LOADING_MS);
  const [isSyntheticAnalyzing, setIsSyntheticAnalyzing] = useState(false);

  useEffect(() => {
    return () => {
      if (syntheticAnalyzeTimeoutRef.current !== null) {
        window.clearTimeout(syntheticAnalyzeTimeoutRef.current);
      }
    };
  }, []);

  function startSyntheticAnalyzeLoading(minLoadingMs: number) {
    if (syntheticAnalyzeTimeoutRef.current !== null) {
      window.clearTimeout(syntheticAnalyzeTimeoutRef.current);
      syntheticAnalyzeTimeoutRef.current = null;
    }

    activeAnalyzeMinLoadingMsRef.current = minLoadingMs;
    syntheticAnalyzeStartedAtRef.current = Date.now();
    setIsSyntheticAnalyzing(true);
  }

  function finishSyntheticAnalyzeLoading() {
    const startedAt = syntheticAnalyzeStartedAtRef.current;

    if (!startedAt) {
      setIsSyntheticAnalyzing(false);
      return;
    }

    const elapsedMs = Date.now() - startedAt;
    const remainingMs = Math.max(0, activeAnalyzeMinLoadingMsRef.current - elapsedMs);

    if (syntheticAnalyzeTimeoutRef.current !== null) {
      window.clearTimeout(syntheticAnalyzeTimeoutRef.current);
      syntheticAnalyzeTimeoutRef.current = null;
    }

    if (remainingMs <= 0) {
      resetSyntheticAnalyzeLoading();
      return;
    }

    syntheticAnalyzeTimeoutRef.current = window.setTimeout(() => {
      resetSyntheticAnalyzeLoading();
    }, remainingMs);
  }

  function resetSyntheticAnalyzeLoading() {
    if (syntheticAnalyzeTimeoutRef.current !== null) {
      window.clearTimeout(syntheticAnalyzeTimeoutRef.current);
      syntheticAnalyzeTimeoutRef.current = null;
    }

    syntheticAnalyzeStartedAtRef.current = null;
    activeAnalyzeMinLoadingMsRef.current = FIRST_ANALYSIS_MIN_LOADING_MS;
    setIsSyntheticAnalyzing(false);
  }

  return {
    isSyntheticAnalyzing,
    startSyntheticAnalyzeLoading,
    finishSyntheticAnalyzeLoading,
    resetSyntheticAnalyzeLoading,
  };
}
