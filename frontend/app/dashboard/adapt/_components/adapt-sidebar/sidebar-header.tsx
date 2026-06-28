import { Loader2, Target } from 'lucide-react';

type Props = {
  canContinue: boolean;
  isCheckingFit: boolean;
};

export function SidebarHeader({ canContinue, isCheckingFit }: Props) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${
          canContinue
            ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20'
            : isCheckingFit
              ? 'bg-blue-500/10 text-blue-300 ring-blue-500/20'
              : 'bg-muted text-muted-foreground ring-border'
        }`}
      >
        {isCheckingFit ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Target className="h-5 w-5" />
        )}
      </div>

      <div className="min-w-0">
        <h2 className="text-lg font-medium text-foreground">Адаптация резюме</h2>

        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Проверим вакансию и соберём черновик: заголовок, опыт, навыки и
          summary.
        </p>
      </div>
    </div>
  );
}
