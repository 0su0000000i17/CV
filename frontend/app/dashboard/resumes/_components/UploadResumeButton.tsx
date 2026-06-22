'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Plus } from 'lucide-react';

import type { UploadedResume } from '@/src/shared/api/resumes';
import { supabase } from '@/src/shared/lib/supabase/client';
import { useUploadResumeMutation } from '@/src/shared/hooks/useUploadResumeMutation';

const ERROR_MESSAGE_VISIBLE_MS = 15_000;

type UploadResumeButtonVariant = 'primary' | 'secondary';

type UploadResumeButtonProps = {
  children?: ReactNode;
  icon?: ReactNode;
  loadingLabel?: string;
  variant?: UploadResumeButtonVariant;
  className?: string;
  errorAlign?: 'left' | 'right';
  onUploaded?: (resume: UploadedResume) => void;
};

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function getButtonVariantClassName(variant: UploadResumeButtonVariant) {
  if (variant === 'secondary') {
    return 'border border-border text-foreground hover:bg-muted';
  }

  return 'bg-foreground text-background hover:bg-foreground/80';
}

export function UploadResumeButton({
  children = 'Загрузить резюме',
  icon,
  loadingLabel = 'Загружаем...',
  variant = 'primary',
  className,
  errorAlign = 'right',
  onUploaded,
}: UploadResumeButtonProps) {
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
        onSuccess: (data) => {
          clearErrorTimer();
          setErrorMessage('');
          event.target.value = '';

          onUploaded?.(data.resume);
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
        className={joinClassNames(
          'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
          getButtonVariantClassName(variant),
          className
        )}
      >
        {icon ?? <Plus className="h-4 w-4" />}
        {uploadResumeMutation.isPending ? loadingLabel : children}
      </button>

      {errorMessage ? (
        <p
          className={joinClassNames(
            'absolute top-full mt-3 w-max max-w-xs text-xs text-red-500',
            errorAlign === 'left' ? 'left-0 text-left' : 'right-0 text-right'
          )}
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}