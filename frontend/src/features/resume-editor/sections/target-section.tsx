'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';

import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';
import type { DraftUpdater } from '@/src/features/resume-editor/model/types';
import { EditorSection } from '@/src/features/resume-editor/ui/editor-section';
import { SmallInput } from '@/src/features/resume-editor/ui/form-controls';

type Props = { draft: ResumeAdaptationResult; updateDraft: DraftUpdater };
type FieldKey = 'title' | 'salary';

const fields: Array<{ key: FieldKey; label: string }> = [
  { key: 'title', label: 'Должность' },
  { key: 'salary', label: 'Зарплата' },
];

export function TargetSection({ draft, updateDraft }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const target = draft.target;

  if (isEditing) {
    return (
      <EditorSection title="Должность и зарплата">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <SmallInput
                key={field.key}
                label={field.label}
                value={target[field.key] || ''}
                onChange={(value) => updateDraft((current) => {
                  current.target[field.key] = value.trim() || null;
                })}
              />
            ))}
          </div>

          <button type="button" onClick={() => setIsEditing(false)} className="cursor-pointer rounded-xl border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted">
            Готово
          </button>
        </div>
      </EditorSection>
    );
  }

  const visible = [target.title, target.salary].filter(Boolean);

  return (
    <EditorSection title="Должность и зарплата">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {visible.length ? visible.map((item, index) => (
            <span key={`${item}-${index}`} className="rounded-lg bg-muted px-3 py-1.5 text-sm text-foreground">
              {item}
            </span>
          )) : <p className="text-sm text-muted-foreground">Можно указать должность и зарплату вручную.</p>}
        </div>
        <button type="button" onClick={() => setIsEditing(true)} className="shrink-0 cursor-pointer rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Редактировать должность и зарплату">
          <Pencil className="h-4 w-4" />
        </button>
      </div>
    </EditorSection>
  );
}
