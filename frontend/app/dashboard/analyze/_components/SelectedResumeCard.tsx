'use client';

import type { UploadedResume } from '@/src/shared/api/resumes';
import { ResumeSelectorCard } from '@/src/shared/ui/ResumeSelectorCard';

type Props = {
  selectedResume?: UploadedResume;
  resumes: UploadedResume[];
  isLoading: boolean;
  isError: boolean;
  onSelectResume: (resumeId: string) => void;
};

export function SelectedResumeCard(props: Props) {
  return (
    <ResumeSelectorCard
      {...props}
      description="Оценка будет запущена для выбранного файла."
      modalDescription="Выбранный файл будет использован на странице оценки."
    />
  );
}