'use client';

import { ContactsSection } from './contacts-section';
import { EducationSection } from './education-section';
import { EditorSection } from './editor-section';
import { SkillsSection } from './skills-section';
import { SummarySection } from './summary-section';
import { useEditorState } from './use-editor-state';
import { WorkSection } from './work-section';

type Props = {
  editor: ReturnType<typeof useEditorState>;
  isProfileLoading: boolean;
};

export function ResumeEditorContent({ editor, isProfileLoading }: Props) {
  if (!editor.draft) {
    return null;
  }

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