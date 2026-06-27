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
        <input
          value={editor.draft.adaptedResume.headline}
          onChange={(event) =>
            editor.updateDraft((current) => {
              current.adaptedResume.headline = event.target.value;
            })
          }
          className="h-12 w-full rounded-xl border border-border bg-background/70 px-4 text-lg font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
        />
      </EditorSection>

      <ContactsSection
        contacts={editor.contacts}
        photoUrl={editor.photoUrl}
        setContacts={editor.setContacts}
        setPhotoUrl={editor.setPhotoUrl}
        isEditing={editor.isContactsEditing}
        isProfileLoading={isProfileLoading}
        setIsEditing={editor.setIsContactsEditing}
      />

      <TargetSection draft={editor.draft} updateDraft={editor.updateDraft} />

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

      <EducationSection
        draft={editor.draft}
        isEditing={editor.isEducationEditing}
        setIsEditing={editor.setIsEducationEditing}
        updateDraft={editor.updateDraft}
      />

      <SummarySection
        draft={editor.draft}
        isEditing={editor.isAboutEditing}
        setIsEditing={editor.setIsAboutEditing}
        updateDraft={editor.updateDraft}
      />
    </div>
  );
}
