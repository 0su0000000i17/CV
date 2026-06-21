'use client';

import { useRef, useState } from 'react';
import { Plus } from 'lucide-react';

import { supabase } from '@/src/shared/lib/supabase/client';
import { useUploadResumeMutation } from '@/src/shared/hooks/useUploadResumeMutation';

export function UploadResumeButton() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const uploadResumeMutation = useUploadResumeMutation();

  const handleSelectFile = () => {
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
      setErrorMessage('Нужно войти в аккаунт.');
      return;
    }

    uploadResumeMutation.mutate(
      {
        file,
        accessToken: session.access_token,
      },
      {
        onSuccess: () => {
          event.target.value = '';
        },
        onError: (error) => {
          setErrorMessage(
            error instanceof Error ? error.message : 'Ошибка загрузки резюме'
          );
        },
      }
    );
  };

  return (
    <div className="flex flex-col items-start gap-2 md:items-end">
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
        <p className="max-w-xs text-right text-xs text-red-500">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
