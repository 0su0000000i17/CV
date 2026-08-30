import { FileText } from 'lucide-react';
import type { UploadedResume } from '@/src/shared/api/resumes';

function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return 'Размер не указан';
  const mb = bytes / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(1)} МБ` : `${Math.round(bytes / 1024)} КБ`;
}
export function getResumeSubtitle(resume: UploadedResume) {
  return resume.role || `${resume.file_type || 'Файл'} · ${formatFileSize(resume.file_size)}`;
}
export function ResumeStatus({ resume }: { resume?: UploadedResume }) {
  let status = { label: 'Не выбрано', className: 'text-white/35' };
  if (typeof resume?.last_score === 'number') {
    status = { label: `${Math.round(resume.last_score)}/100`, className: 'text-white/75' };
  } else if (resume?.analysis_status === 'analyzing') {
    status = { label: 'Оценивается', className: 'text-white/55' };
  } else if (resume?.analysis_status === 'failed') {
    status = { label: 'Ошибка оценки', className: 'text-red-300' };
  } else if (resume?.analysis_status === 'needs_update') {
    status = { label: 'Нужно обновить', className: 'text-amber-200' };
  } else if (resume) status = { label: 'Не оценено', className: 'text-white/35' };
  return <span className={`inline-flex shrink-0 rounded-lg border border-white/10 bg-white/[0.025] px-2.5 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>;
}
export function ResumeFileIcon() {
  return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-white/50">
    <FileText className="h-4 w-4" strokeWidth={1.6} />
  </span>;
}
