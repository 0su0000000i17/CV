'use client';

import { ContactsSection } from '@/src/features/resume-editor/contacts/contacts-section';
import { WorkSection } from '@/src/features/resume-editor/experience/work-section';
import { TargetSection } from '@/src/features/resume-editor/sections/target-section';
import { EducationSection } from '@/src/features/resume-editor/sections/education-section';
import { SkillsSection } from '@/src/features/resume-editor/sections/skills-section';
import { SummarySection } from '@/src/features/resume-editor/sections/summary-section';
import { useEditorState } from '@/src/features/resume-editor/model/use-editor-state';
import { EditorSection } from '@/src/features/resume-editor/ui/editor-section';

type Props = {
  editor: ReturnType<typeof useEditorState>;
  isProfileLoading: boolean;
};

export function ResumeEditorContent({ editor, isProfileLoading }: Props) {
  if (!editor.draft) return null;

  return (
    <div className="space-y-5">
      <EditorSection title="Заголовок">
        <p className="text-lg font-medium text-foreground">
          {editor.draft.adaptedResume.headline || '—'}
        </p>
      </EditorSection>

      <ContactsSection
        contacts={editor.contacts}
        photoUrl={editor.photoUrl}
        isProfileLoading={isProfileLoading}
      />

      <TargetSection draft={editor.draft} />

      <WorkSection
        draft={editor.draft}
        expandedIndexes={editor.expandedExperienceIndexes}
        editingIndex={editor.editingExperienceIndex}
        setEditingIndex={editor.setEditingExperienceIndex}
        toggleExpanded={editor.toggleExpandedExperience}
        updateDraft={editor.updateDraft}
      />

      <SkillsSection
        draft={editor.draft}
        isEditing={editor.isSkillsEditing}
        setIsEditing={editor.setIsSkillsEditing}
        updateDraft={editor.updateDraft}
      />

      <EducationSection draft={editor.draft} />

      <SummarySection
        draft={editor.draft}
        isEditing={editor.isAboutEditing}
        setIsEditing={editor.setIsAboutEditing}
        updateDraft={editor.updateDraft}
      />
    </div>
  );
}
