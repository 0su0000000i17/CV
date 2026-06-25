import { Pencil } from 'lucide-react';

import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';
import type { DraftUpdater } from '@/src/features/resume-editor/model/types';
import { listToText, textToList } from '@/src/features/resume-editor/model/text';
import { EditorSection } from '@/src/features/resume-editor/ui/editor-section';
import { TextArea } from '@/src/features/resume-editor/ui/form-controls';

type Props = {
  draft: ResumeAdaptationResult;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  updateDraft: DraftUpdater;
};

export function SkillsSection({
  draft,
  isEditing,
  setIsEditing,
  updateDraft,
}: Props) {
  const allVisibleSkills = [
    ...draft.adaptedResume.skills.primary,
    ...draft.adaptedResume.skills.secondary,
  ];

  return (
    <EditorSection title="Навыки">
      {isEditing ? (
        <div className="space-y-4">
          <TextArea
            value={listToText(draft.adaptedResume.skills.primary)}
            rows={6}
            placeholder="Основные навыки, каждый с новой строки"
            onChange={(value) =>
              updateDraft((current) => {
                current.adaptedResume.skills.primary = textToList(value);
              })
            }
          />

          <TextArea
            value={listToText(draft.adaptedResume.skills.secondary)}
            rows={6}
            placeholder="Дополнительные навыки, каждый с новой строки"
            onChange={(value) =>
              updateDraft((current) => {
                current.adaptedResume.skills.secondary = textToList(value);
              })
            }
          />

          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="cursor-pointer rounded-xl border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            Готово
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-start justify-between gap-4">
            <p className="text-sm text-muted-foreground">Продвинутый уровень</p>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="shrink-0 cursor-pointer rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Редактировать навыки"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {allVisibleSkills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="rounded-lg bg-muted px-3 py-1.5 text-sm text-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </EditorSection>
  );
}
