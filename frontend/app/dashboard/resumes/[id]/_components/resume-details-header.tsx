import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import type { UploadedResume } from '@/src/shared/api/resumes';

type Props = {
  resume: UploadedResume;
};

function formatFileSize(size: number | null) {
  if (!size) return 'JSON';
  return `${Math.round(size / 1024)} KB`;
}

function getFileType(mimeType: string) {
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('wordprocessingml')) return 'DOCX';
  if (mimeType.includes('msword')) return 'DOC';
  if (mimeType.includes('rtf')) return 'RTF';

  return 'Файл';
}

export function ResumeDetailsHeader({ resume }: Props) {
  return (
    <div className="mb-8 min-w-0">
      <Link
        href="/dashboard/resumes"
        className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад к резюме
      </Link>

      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Личный кабинет / Резюме
      </p>

      <div className="min-w-0">
        <h1
          title={resume.title}
          className="max-w-full truncate text-4xl font-normal tracking-tight text-foreground md:text-5xl"
        >
          {resume.title}
        </h1>

        <p
          title={resume.role || 'Роль не указана'}
          className="mt-4 max-w-full truncate text-muted-foreground"
        >
          {resume.role || 'Роль не указана'} ·{' '}
          {getFileType(resume.file_type)} ·{' '}
          {formatFileSize(resume.file_size)}
        </p>
      </div>
    </div>
  );
}
