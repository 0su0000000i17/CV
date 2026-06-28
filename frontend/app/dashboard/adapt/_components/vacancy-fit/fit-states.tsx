import { CircleAlert, Sparkles, Target } from 'lucide-react';

export function FitCheckingState() {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">
            Проверяем резюме и вакансию
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Смотрим, можно ли адаптировать опыт кандидата под эту вакансию без
            выдумывания навыков, должностей и проектов.
          </p>
        </div>
      </div>
    </section>
  );
}

export function FitErrorState({ errorMessage }: { errorMessage?: string }) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300 ring-1 ring-red-500/20">
          <CircleAlert className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">
            Не удалось проверить совместимость
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {errorMessage ||
              'Попробуйте ещё раз. Если ошибка повторится, проверим backend-логи.'}
          </p>
        </div>
      </div>
    </section>
  );
}

export function FitEmptyState() {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20">
          <Target className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">
            Проверка перед адаптацией
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Сначала сервис проверит, подходит ли выбранное резюме под вакансию.
            Если адаптация потребует выдумывания опыта, мы её заблокируем.
          </p>
        </div>
      </div>
    </section>
  );
}
