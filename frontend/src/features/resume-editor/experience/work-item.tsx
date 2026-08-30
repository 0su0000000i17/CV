import { Pencil } from 'lucide-react';

import { getCompanyInitials } from '@/src/features/resume-editor/model/text';
import type { DraftUpdater } from '@/src/features/resume-editor/model/types';

import { WorkEditForm } from './work-edit-form';
import { WorkPreview } from './work-preview';

type WorkItemDraft = {
  sourceIndex: number;
  company?: string | null;
  companyCity?: string | null;
  companyUrl?: string | null;
  companyIndustries?: string[];
  position?: string | null;
  dates?: string | null;
  description?: string | null;
  focus?: string | null;
  adaptedBullets: string[];
};

type Props = {
  item: WorkItemDraft;
  index: number;
  isExpanded: boolean;
  isEditing: boolean;
  onToggleExpanded: () => void;
  onToggleEditing: () => void;
  onStopEditing: () => void;
  updateDraft: DraftUpdater;
};

export function WorkItem({
  item,
  index,
  isExpanded,
  isEditing,
  onToggleExpanded,
  onToggleEditing,
  onStopEditing,
  updateDraft,
}: Props) {
  const companyInitials = getCompanyInitials(item.company);

  return (
    <div className="py-5 first:pt-0 last:pb-0">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-xs font-medium text-muted-foreground">
            {companyInitials}
          </div>

          <div className="mt-4 h-2 w-2 rounded-full bg-muted-foreground/50" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate text-base font-medium text-foreground">
                {item.company || 'Компания не указана'}
              </h3>

              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {item.companyCity ? <span>{item.companyCity}</span> : null}
                {item.companyUrl ? <span>{item.companyUrl}</span> : null}
                {item.dates ? <span>{item.dates}</span> : null}
              </div>
              {item.companyIndustries?.length ? (
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {item.companyIndustries.map((industry) => <p key={industry}>{industry}</p>)}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onToggleEditing}
              className="shrink-0 cursor-pointer rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Редактировать опыт"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4">
            <h4 className="font-medium text-foreground">
              {item.position || 'Должность не указана'}
            </h4>

            {isEditing ? (
              <WorkEditForm
                item={item}
                index={index}
                updateDraft={updateDraft}
                onDone={onStopEditing}
              />
            ) : (
              <WorkPreview
                description={item.description}
                focus={item.focus}
                bullets={item.adaptedBullets}
                isExpanded={isExpanded}
                onToggleExpanded={onToggleExpanded}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
