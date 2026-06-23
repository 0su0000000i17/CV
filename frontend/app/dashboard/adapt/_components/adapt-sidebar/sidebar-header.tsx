import { Loader2, ShieldCheck, Sparkles } from 'lucide-react';

type Props = {
  canContinue: boolean;
  isCheckingFit: boolean;
};

export function SidebarHeader({ canContinue, isCheckingFit }: Props) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div
        className={`rounded-xl p-2.5 ${
          canContinue
            ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20'
            : isCheckingFit
              ? 'bg-muted text-foreground'
              : 'bg-muted text-muted-foreground'
        }`}
      >
        {isCheckingFit ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : canContinue ? (
          <ShieldCheck className="h-5 w-5" />
        ) : (
          <Sparkles className="h-5 w-5" />
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
