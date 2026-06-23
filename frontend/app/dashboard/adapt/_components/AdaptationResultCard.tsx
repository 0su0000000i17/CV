'use client';

import { useEffect, useMemo, useState } from 'react';

import { AboutSection } from './adaptation-result/summary-section';
import { ContactsSection } from './adaptation-result/contacts-section';
import { EditorSection } from './adaptation-result/editor-section';
import { EditorSidebar } from './adaptation-result/editor-sidebar';
import { EducationSection } from './adaptation-result/education-section';
import { ErrorState, LoadingState } from './adaptation-result/result-states';
import { SkillsSection } from './adaptation-result/skills-section';
import type {
  AdaptationResultCardProps,
  ContactDraft,
} from './adaptation-result/types';
import { WorkSection } from './adaptation-result/work-section';
import {
  cloneAdaptation,
  createPlainResumeText,
} from './adaptation-result/utils';
import type { ResumeAdaptationResult } from '@/src/shared/api/resumeAdaptation';

export function AdaptationResultCard({
  adaptationResponse,
  isAdapting,
  isError,
  errorMessage,
  onResetAdaptation,
}: AdaptationResultCardProps) {
  const [draft, setDraft] = useState<ResumeAdaptationResult | null>(null);
  const [contacts, setContacts] = useState<ContactDraft>({
    fullName: '',
    phone: '',
    email: '',
    city: '',
  });

  const [expandedExperienceIndexes, setExpandedExperienceIndexes] = useState<
    number[]
  >([]);
  const [editingExperienceIndex, setEditingExperienceIndex] = useState<
    number | null
  >(null);
  const [isContactsEditing, setIsContactsEditing] = useState(false);
  const [isSkillsEditing, setIsSkillsEditing] = useState(false);
  const [isEducationEditing, setIsEducationEditing] = useState(false);
  const [isAboutEditing, setIsAboutEditing] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>(
    'idle'
  );

  useEffect(() => {
    if (!adaptationResponse?.adaptation) {
      setDraft(null);
      return;
    }

    setDraft(cloneAdaptation(adaptationResponse.adaptation));
    setExpandedExperienceIndexes([]);
    setEditingExperienceIndex(null);
    setIsContactsEditing(false);
    setIsSkillsEditing(false);
    setIsEducationEditing(false);
    setIsAboutEditing(false);
  }, [adaptationResponse]);

  const plainResumeText = useMemo(() => {
    if (!draft) {
      return '';
    }

    return createPlainResumeText(draft, contacts);
  }, [contacts, draft]);

  if (isAdapting) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState errorMessage={errorMessage} />;
  }

  if (!adaptationResponse || !draft) {
    return null;
  }

  function updateDraft(updater: (current: ResumeAdaptationResult) => void) {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      const next = cloneAdaptation(current);
      updater(next);

      return next;
    });
  }

  function resetDraftToAiVersion() {
    if (!adaptationResponse?.adaptation) {
      return;
    }

    setDraft(cloneAdaptation(adaptationResponse.adaptation));
  }

  function toggleExpandedExperience(index: number) {
    setExpandedExperienceIndexes((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  }

  async function copyResumeText() {
    try {
      await navigator.clipboard.writeText(plainResumeText);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    } finally {
      window.setTimeout(() => setCopyStatus('idle'), 1800);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <EditorSection title="Заголовок">
          <input
            value={draft.adaptedResume.headline}
            onChange={(event) =>
              updateDraft((current) => {
                current.adaptedResume.headline = event.target.value;
              })
            }
            className="h-12 w-full rounded-xl border border-border bg-background/70 px-4 text-lg font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
          />
        </EditorSection>

        <ContactsSection
          contacts={contacts}
          setContacts={setContacts}
          isEditing={isContactsEditing}
          setIsEditing={setIsContactsEditing}
        />

        <WorkSection
          draft={draft}
          expandedIndexes={expandedExperienceIndexes}
          editingIndex={editingExperienceIndex}
          setEditingIndex={setEditingExperienceIndex}
          toggleExpanded={toggleExpandedExperience}
          updateDraft={updateDraft}
        />

        <SkillsSection
          draft={draft}
          isEditing={isSkillsEditing}
          setIsEditing={setIsSkillsEditing}
          updateDraft={updateDraft}
        />

        <EducationSection
          draft={draft}
          isEditing={isEducationEditing}
          setIsEditing={setIsEducationEditing}
          updateDraft={updateDraft}
        />

        <AboutSection
          draft={draft}
          isEditing={isAboutEditing}
          setIsEditing={setIsAboutEditing}
          updateDraft={updateDraft}
        />
      </div>

      <EditorSidebar
        draft={draft}
        copyStatus={copyStatus}
        onCopyResumeText={copyResumeText}
        onResetDraftToAiVersion={resetDraftToAiVersion}
        onResetAdaptation={onResetAdaptation}
      />
    </div>
  );
}
