import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';

import type { DraftUpdater } from '@/src/features/resume-editor/model/types';
import { EditorSection } from '@/src/features/resume-editor/ui/editor-section';

import { WorkItem } from './work-item';

type Props = {
  draft: ResumeAdaptationResult;
  expandedIndexes: number[];
  editingIndex: number | null;
  setEditingIndex: (index: number | null) => void;
  toggleExpanded: (index: number) => void;
  updateDraft: DraftUpdater;
};

export function WorkSection({
  draft,
  expandedIndexes,
  editingIndex,
  setEditingIndex,
  toggleExpanded,
  updateDraft,
}: Props) {
  return (
    <EditorSection title="Опыт работы">
      {draft.adaptedResume.experience.length ? (
        <div className="divide-y divide-border">
          {draft.adaptedResume.experience.map((item, index) => {
            const isExpanded = expandedIndexes.includes(index);
            const isEditing = editingIndex === index;

            return (
              <WorkItem
                key={`${item.sourceIndex}-${item.company}-${item.position}-${index}`}
                item={item}
                index={index}
                isExpanded={isExpanded}
                isEditing={isEditing}
                onToggleExpanded={() => toggleExpanded(index)}
                onToggleEditing={() => setEditingIndex(isEditing ? null : index)}
                onStopEditing={() => setEditingIndex(null)}
                updateDraft={updateDraft}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-background/60 p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Опыт работы не распознан автоматически. Проверьте исходный текст резюме.
          </p>
        </div>
      )}
    </EditorSection>
  );
}
