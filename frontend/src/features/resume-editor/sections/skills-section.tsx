import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';
import type { DraftUpdater } from '@/src/features/resume-editor/model/types';
import { EditorSection } from '@/src/features/resume-editor/ui/editor-section';

import { SkillsDisplay } from './skills-display';
import { SkillsEditor } from './skills-editor';
import { useSkillsEditor } from './use-skills-editor';

type Props = {
  draft: ResumeAdaptationResult;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  updateDraft: DraftUpdater;
};

export function SkillsSection({ draft, isEditing, setIsEditing, updateDraft }: Props) {
  const editor = useSkillsEditor({ draft, setIsEditing, updateDraft });
  return (
    <EditorSection title="Навыки">
      {isEditing ? (
        <SkillsEditor
          inputValue={editor.inputValue}
          skills={editor.skills}
          onAdd={editor.addSkillsFromInput}
          onFinish={editor.finishEditing}
          onInputChange={editor.setInputValue}
          onInputKeyDown={editor.handleInputKeyDown}
          onRemove={editor.removeSkill}
        />
      ) : (
        <SkillsDisplay skills={editor.skills} onEdit={() => setIsEditing(true)} />
      )}
    </EditorSection>
  );
}
