import type { UploadedResume } from '@/src/shared/api/resumes';
import { ResumeSelectorCard } from '@/src/shared/ui/resume-selector-card';

type Props = {
  selectedResume?: UploadedResume;
  resumes: UploadedResume[];
  isLoading: boolean;
  isError: boolean;
  onSelectResume: (resumeId: string) => void;
};

export function CoverLetterResumeCard(props: Props) {
  return (
    <ResumeSelectorCard
      {...props}
      title="Резюме"
      description="Выберите резюме, на основе которого нужно написать письмо"
      modalTitle="Выберите резюме"
      modalDescription="Выбранный файл будет использован для генерации сопроводительного письма"
      emptyTitle="Резюме не выбрано"
      emptyDescription="Загрузите резюме или выберите файл из списка"
    />
  );
}
