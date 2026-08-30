import { useCallback, useEffect, useRef, useState, type ChangeEvent, type RefObject } from 'react';

import type { UploadedResume } from '@/src/shared/api/resumes';
import { useUploadResumeMutation } from '@/src/shared/hooks/use-upload-resume-mutation';
import { supabase } from '@/src/shared/lib/supabase/client';

const ERROR_VISIBLE_MS = 15_000;

export function useResumeUpload(params: {
  currentCount: number;
  inputRef: RefObject<HTMLInputElement | null>;
  maxCount: number;
  onUploaded?: (resume: UploadedResume) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const mutation = useUploadResumeMutation();
  const hasReachedLimit = params.currentCount >= params.maxCount;
  const limitMessage = `Можно загрузить максимум ${params.maxCount} резюме. Удалите одно из старых резюме, чтобы добавить новое.`;

  const clearError = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);
  const showError = useCallback((message: string) => {
    clearError();
    setErrorMessage(message);
    timerRef.current = setTimeout(() => {
      setErrorMessage('');
      timerRef.current = null;
    }, ERROR_VISIBLE_MS);
  }, [clearError]);

  function selectFile() {
    clearError();
    setErrorMessage('');
    if (hasReachedLimit) return showError(limitMessage);
    params.inputRef.current?.click();
  }

  async function uploadFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    if (hasReachedLimit) {
      showError(limitMessage);
      input.value = '';
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      showError('Нужно войти в аккаунт.');
      input.value = '';
      return;
    }
    mutation.mutate(
      { file, accessToken: session.access_token },
      {
        onSuccess: (data) => {
          clearError();
          setErrorMessage('');
          input.value = '';
          params.onUploaded?.(data.resume);
        },
        onError: (error) => {
          showError(error instanceof Error ? error.message : 'Ошибка загрузки резюме');
          input.value = '';
        },
      }
    );
  }

  useEffect(() => clearError, [clearError]);
  return { errorMessage, isPending: mutation.isPending, selectFile, uploadFile };
}
