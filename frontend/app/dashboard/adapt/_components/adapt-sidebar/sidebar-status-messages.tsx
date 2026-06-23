import { CircleDashed, Loader2 } from 'lucide-react';

type Props = {
  hasFitResult: boolean;
  canContinue: boolean;
  isCheckingFit: boolean;
};

export function SidebarStatusMessages({
  hasFitResult,
  canContinue,
  isCheckingFit,
}: Props) {
  return (
    <>
      {!hasFitResult && !isCheckingFit ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-background/60 px-3 py-3">
          <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

          <p className="text-xs leading-relaxed text-muted-foreground">
            Сначала выберите резюме, вставьте вакансию и нажмите «Проверить
            совместимость».
          </p>
        </div>
      ) : null}

      {isCheckingFit ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-background/60 px-3 py-3">
          <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-muted-foreground" />

          <p className="text-xs leading-relaxed text-muted-foreground">
            Проверяем, можно ли адаптировать резюме без выдумывания опыта.
          </p>
        </div>
      ) : null}

      {hasFitResult && !canContinue ? (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-3">
          <p className="text-xs leading-relaxed text-red-200">
            Адаптация недоступна: проверка показала, что резюме не подходит
            вакансии без выдумывания опыта.
          </p>
        </div>
      ) : null}
    </>
  );
}
