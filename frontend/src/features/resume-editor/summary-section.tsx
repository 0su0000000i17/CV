import { Pencil } from 'lucide-react';

import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';
import { EditorSection } from './editor-section';
import { TextArea } from './form-controls';
import { DraftUpdater } from './types';


type Props = {
  draft: ResumeAdaptationResult;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  updateDraft: DraftUpdater;
};

export function SummarySection({
  draft,
  isEditing,
  setIsEditing,
  updateDraft,
}: Props) {
  return (
    <EditorSection title="О себе">
      {isEditing ? (
        <div className="space-y-4">
          <TextArea
            value={draft.adaptedResume.summary}
            rows={7}
            onChange={(value) =>
              updateDraft((current) => {
                current.adaptedResume.summary = value;
              })
            }
          />

          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-xl border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            Готово
          </button>
        </div>
      ) : (
        <div className="flex min-h-[120px] items-start justify-between gap-4">
          <p className="max-h-[84px] min-w-0 flex-1 overflow-hidden text-sm leading-relaxed text-foreground">
            {draft.adaptedResume.summary}
          </p>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="shrink-0 rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Редактировать о себе"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      )}
    </EditorSection>
  );
}
