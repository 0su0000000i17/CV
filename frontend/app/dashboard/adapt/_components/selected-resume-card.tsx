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
      description="Именно этот файл будет адаптирован под вакансию."
      modalDescription="Выбранный файл будет использован для адаптации под вакансию."
    />
  );
}
