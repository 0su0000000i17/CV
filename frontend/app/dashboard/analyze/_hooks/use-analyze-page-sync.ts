import { useEffect, useRef } from 'react';
import type { useRouter } from 'next/navigation';

import type { UploadedResume } from '@/src/shared/api/resumes';

import { createResumeRoute } from './analyze-route-helpers';

type Props = {
  accessToken?: string;
  autoRun: boolean;
  isMutationPending: boolean;
  resumeId: string | null;
  router: ReturnType<typeof useRouter>;
  searchParams: string;
  selectedResume?: UploadedResume;
  selectedResumeId: string | null;
  onAutoRun: (resume: UploadedResume) => void;
  onSelect: (resumeId: string) => void;
};

export function useAnalyzePageSync(props: Props) {
  const autoRunStartedRef = useRef<string | null>(null);
  const {
    accessToken,
    autoRun,
    isMutationPending,
    onAutoRun,
    onSelect,
    resumeId,
    router,
    searchParams,
    selectedResume,
    selectedResumeId,
  } = props;

  useEffect(() => {
    if (!selectedResume?.id || selectedResumeId === selectedResume.id) return;
    onSelect(selectedResume.id);
  }, [onSelect, selectedResume?.id, selectedResumeId]);

  useEffect(() => {
    if (!selectedResume?.id || resumeId === selectedResume.id) return;
    router.replace(createResumeRoute(
      '/dashboard/analyze',
      searchParams,
      selectedResume.id,
      { autoRun }
    ));
  }, [autoRun, resumeId, router, searchParams, selectedResume?.id]);

  useEffect(() => {
    if (!autoRun || !selectedResume?.id || !accessToken) return;
    if (isMutationPending) return;
    const key = `${selectedResume.id}:${searchParams}`;
    if (autoRunStartedRef.current === key) return;
    autoRunStartedRef.current = key;
    onAutoRun(selectedResume);
  // Ref intentionally keys this effect only to the auto-run request identity.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, autoRun, searchParams, selectedResume?.id]);
}
