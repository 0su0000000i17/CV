'use client';

import { Plus } from 'lucide-react';
import { useRef, type ReactNode } from 'react';

import type { UploadedResume } from '@/src/shared/api/resumes';

import { getUploadButtonClass, joinClassNames, type UploadButtonVariant } from './upload-button-styles';
import { useResumeUpload } from './use-resume-upload';

const MAX_RESUMES_PER_USER = 10;

type Props = {
  children?: ReactNode;
  icon?: ReactNode;
  loadingLabel?: string;
  variant?: UploadButtonVariant;
  className?: string;
  errorAlign?: 'left' | 'right';
  currentResumeCount?: number;
  maxResumeCount?: number;
  onUploaded?: (resume: UploadedResume) => void;
};

export function UploadResumeButton({
  children = 'Загрузить резюме',
  icon,
  loadingLabel = 'Загружаем...',
  variant = 'primary',
  className,
  errorAlign = 'right',
  currentResumeCount = 0,
  maxResumeCount = MAX_RESUMES_PER_USER,
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const upload = useResumeUpload({
    currentCount: currentResumeCount,
    inputRef,
    maxCount: maxResumeCount,
    onUploaded,
  });
  return (
    <div className="relative flex items-start md:items-end">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={upload.uploadFile}
      />
      <button
        type="button"
        onClick={upload.selectFile}
        disabled={upload.isPending}
        className={joinClassNames(
          'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-[background-color,color,transform] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
          getUploadButtonClass(variant),
          className
        )}
      >
        {icon ?? <Plus className="h-4 w-4" />}
        {upload.isPending ? loadingLabel : children}
      </button>
      {upload.errorMessage ? (
        <p className={joinClassNames(
          'absolute top-full z-20 mt-3 w-72 max-w-[min(18rem,calc(100vw-2rem))] whitespace-normal break-words rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-left text-xs leading-relaxed text-red-300 shadow-xl shadow-black/20',
          errorAlign === 'left' ? 'left-0' : 'right-0'
        )}>
          {upload.errorMessage}
        </p>
      ) : null}
    </div>
  );
}
