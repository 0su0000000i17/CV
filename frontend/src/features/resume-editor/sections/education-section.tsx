import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';
import { EditorSection } from '@/src/features/resume-editor/ui/editor-section';

import { EducationDisplay } from './education-display';

export function EducationSection({ draft }: { draft: ResumeAdaptationResult }) {
  return (
    <EditorSection
      title="Образование"
      description="Сохраняется из исходного резюме без редактирования."
    >
      <EducationDisplay notes={draft.adaptedResume.education.notes} />
    </EditorSection>
  );
}
