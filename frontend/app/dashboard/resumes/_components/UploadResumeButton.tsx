'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';

import { supabase } from '@/src/shared/lib/supabase/client';
import { useUploadResumeMutation } from '@/src/shared/hooks/useUploadResumeMutation';

const ERROR_MESSAGE_VISIBLE_MS = 15_000;

export function UploadResumeButton() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const uploadResumeMutation = useUploadResumeMutation();

  const clearErrorTimer = () => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  };

  const showTemporaryError = (message: string) => {
    clearErrorTimer();
    setErrorMessage(message);

    errorTimerRef.current = setTimeout(() => {
      setErrorMessage('');
      errorTimerRef.current = null;
    }, ERROR_MESSAGE_VISIBLE_MS);
  };

  const handleSelectFile = () => {
    clearErrorTimer();
    setErrorMessage('');
    inputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      showTemporaryError('Нужно войти в аккаунт.');
      event.target.value = '';
      return;
    }

    uploadResumeMutation.mutate(
      {
        file,
        accessToken: session.access_token,
      },
      {
        onSuccess: () => {
          clearErrorTimer();
          setErrorMessage('');
          event.target.value = '';
        },
        onError: (error) => {
          showTemporaryError(
            error instanceof Error ? error.message : 'Ошибка загрузки резюме'
          );
          event.target.value = '';
        },
      }
    );
  };

  useEffect(() => {
    return () => {
      clearErrorTimer();
    };
  }, []);

  return (
    <div className="relative flex items-start md:items-end">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.rtf"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={handleSelectFile}
        disabled={uploadResumeMutation.isPending}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Plus className="h-4 w-4" />
        {uploadResumeMutation.isPending ? 'Загружаем...' : 'Загрузить резюме'}
      </button>

      {errorMessage ? (
        <p className="absolute right-0 top-full mt-3 w-max max-w-xs text-right text-xs text-red-500">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}