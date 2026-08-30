import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';
import { EditorSection } from '@/src/features/resume-editor/ui/editor-section';

type Props = {
  draft: ResumeAdaptationResult;
};

export function TargetSection({ draft }: Props) {
  const target = draft.target;
  const specializations = target.specializations.filter(Boolean);

  return (
    <EditorSection
      title="Желаемая профессия и условия"
      description="Поля сохраняются из исходного резюме без редактирования."
    >
      <div className="space-y-3 text-sm">
        <div className="flex items-start justify-between gap-4">
          <span className="text-muted-foreground">Профессия</span>
          <span className="text-right font-medium text-foreground">
            {target.title || '—'}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <span className="text-muted-foreground">Уровень дохода</span>
          <span className="text-right font-medium text-foreground">
            {target.salary || '—'}
          </span>
        </div>

        {specializations.length ? (
          <div className="flex items-start justify-between gap-4">
            <span className="text-muted-foreground">Специализации</span>
            <span className="text-right font-medium text-foreground">
              {specializations.join(', ')}
            </span>
          </div>
        ) : null}
      </div>
    </EditorSection>
  );
}
