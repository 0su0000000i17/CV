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

export function EducationSection({
  draft,
  isEditing,
  setIsEditing,
  updateDraft,
}: Props) {
  return (
    <EditorSection title="Образование">
      {isEditing ? (
        <div className="space-y-4">
          <TextArea
            value={listToText(draft.adaptedResume.education.notes)}
            rows={5}
            placeholder="Образование или комментарии по блоку"
            onChange={(value) =>
              updateDraft((current) => {
                current.adaptedResume.education.notes = textToList(value);
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
        <div className="flex min-h-[110px] items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">
              {draft.adaptedResume.education.policy === 'not_found'
                ? 'Образование не найдено в исходном резюме.'
                : 'Образование сохранено без изменений.'}
            </p>

            <div className="mt-3 space-y-2">
              {draft.adaptedResume.education.notes.length ? (
                draft.adaptedResume.education.notes.map((note, index) => (
                  <p
                    key={`${note}-${index}`}
                    className="text-sm leading-relaxed text-foreground"
                  >
                    {note}
                  </p>
                ))
              ) : (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Блок можно заполнить вручную.
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="shrink-0 cursor-pointer rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Редактировать образование"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      )}
    </EditorSection>
  );
}
