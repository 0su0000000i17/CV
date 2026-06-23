import type { ResumeAdaptationResult } from '@/src/shared/api/resumeAdaptation';

import { EditorSection } from './editor-section';
import type { DraftUpdater } from './types';
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
      <div className="divide-y divide-border">
        {draft.adaptedResume.experience.map((item, index) => {
          const isExpanded = expandedIndexes.includes(index);
          const isEditing = editingIndex === index;

          return (
            <WorkItem
              key={`${item.sourceIndex}-${item.company}-${item.position}`}
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
    </EditorSection>
  );
}
