'use client';

import { ContactsSection } from './adaptation-result/contacts-section';
import { EditorSection } from './adaptation-result/editor-section';
import { EditorSidebar } from './adaptation-result/editor-sidebar';
import { EducationSection } from './adaptation-result/education-section';
import { ErrorState, LoadingState } from './adaptation-result/result-states';
import { SkillsSection } from './adaptation-result/skills-section';
import { SummarySection } from './adaptation-result/summary-section';
import type { AdaptationResultCardProps } from './adaptation-result/types';
import { useEditorState } from './adaptation-result/use-editor-state';
import { WorkSection } from './adaptation-result/work-section';

export function AdaptationResultCard({
  adaptationResponse,
  profileExtraction,
  sourceResume,
  isAdapting,
  isError,
  isProfileLoading,
  errorMessage,
  onResetAdaptation,
}: AdaptationResultCardProps) {
  const editor = useEditorState({
    adaptationResponse,
    profileExtraction,
    sourceResume,
  });

  if (isAdapting) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState errorMessage={errorMessage} />;
  }

  if (!adaptationResponse || !editor.draft) {
    return null;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
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

      <EditorSidebar
        draft={editor.draft}
        copyStatus={editor.copyStatus}
        onCopyResumeText={editor.copyResumeText}
        onResetAdaptation={onResetAdaptation}
      />
    </div>
  );
}