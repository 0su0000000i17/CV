import type { UploadedResume } from '@/src/shared/api/resumes';

import { ResumeEmptyState } from './resume-empty-state';
import { ResumeListItem } from './resume-list-item';
import { ResumeListSkeleton } from './resume-list-skeleton';

type Props = {
  allResumes: UploadedResume[];
  filteredResumes: UploadedResume[];
  isDeleting: boolean;
  isError: boolean;
  isLoading: boolean;
  onDelete: (resume: UploadedResume) => void;
};

export function ResumesListContent(props: Props) {
  if (props.isLoading) return <ResumeListSkeleton />;
  if (props.isError) {
    return (
      <div className="p-8 text-center text-sm text-red-300">
        Не удалось загрузить резюме. Обновите страницу и попробуйте снова.
      </div>
    );
  }
  if (props.allResumes.length === 0) return <ResumeEmptyState />;
  if (props.filteredResumes.length === 0) {
    return (
      <div className="px-6 py-14 text-center">
        <p className="text-sm font-medium text-foreground">Ничего не найдено</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Измените запрос или выберите другой фильтр.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/10">
      {props.filteredResumes.map((resume) => (
        <ResumeListItem
          key={resume.id}
          resume={resume}
          isDeleting={props.isDeleting}
          onDelete={props.onDelete}
        />
      ))}
    </div>
  );
}
