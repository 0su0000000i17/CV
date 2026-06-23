import {
  AlertCircle,
  Copy,
  FileText,
  RotateCcw,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';

import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';

import { SideBlock } from './sidebar-list-block';

type Props = {
  draft: ResumeAdaptationResult;
  copyStatus: 'idle' | 'copied' | 'error';
  onCopyResumeText: () => void;
  onResetAdaptation: () => void;
};

export function EditorSidebar({
  draft,
  copyStatus,
  onCopyResumeText,
  onResetAdaptation,
}: Props) {
  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-300 ring-1 ring-emerald-500/20">
            <FileText className="h-4 w-4" />
          </div>

          <div>
            <h2 className="font-medium text-foreground">
              Редактор адаптированного резюме
            </h2>

            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Проверьте черновик и скопируйте текст для отклика.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={onCopyResumeText}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <Copy className="h-4 w-4" />
            {copyStatus === 'copied'
              ? 'Скопировано'
              : copyStatus === 'error'
                ? 'Не скопировано'
                : 'Скопировать текст'}
          </button>

          <button
            type="button"
            onClick={onResetAdaptation}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-300 transition-colors hover:bg-orange-500/15"
          >
            <RotateCcw className="h-4 w-4" />
            Сбросить адаптацию
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-4">
        <h3 className="font-medium text-foreground">Совет</h3>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Перед откликом проверьте опыт, навыки и summary, чтобы не появилось
          лишних фактов.
        </p>
      </div>

      <SideBlock
        title="Что изменено"
        icon={Sparkles}
        items={draft.changes}
        tone="green"
      />

      <SideBlock
        title="Предупреждения"
        icon={TriangleAlert}
        items={draft.warnings}
        tone="orange"
      />

      <SideBlock
        title="Что не было добавлено"
        icon={AlertCircle}
        items={draft.forbiddenClaims}
        tone="orange"
      />
    </aside>
  );
}