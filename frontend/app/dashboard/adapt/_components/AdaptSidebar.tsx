import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

const resultItems = [
  "Новая версия резюме под вакансию",
  "Список внесённых изменений",
  "Рекомендации перед откликом",
  "Возможность скачать результат",
];

export function AdaptSidebar() {
  return (
    <aside className="space-y-6">
      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="mb-5 w-fit rounded-xl bg-muted p-3">
          <Sparkles className="h-5 w-5 text-foreground" />
        </div>

        <h2 className="text-xl font-medium text-foreground">
          Что будет создано
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          После запуска адаптации сервис создаст отдельную версию резюме.
          Оригинальный файл не изменится.
        </p>

        <div className="mt-6 space-y-3">
          {resultItems.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-xl border border-border bg-background p-4"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />

              <p className="text-sm leading-relaxed text-muted-foreground">
                {item}
              </p>
            </div>
          ))}
        </div>

        <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80">
          Адаптировать резюме
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <h2 className="font-medium text-foreground">Совет</h2>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Чем подробнее описание вакансии, тем точнее будет адаптация. Лучше
          вставлять полный текст: задачи, требования и стек.
        </p>
      </div>
    </aside>
  );
}