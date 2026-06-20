import { AlertCircle, ArrowRight } from "lucide-react";

const resultPreview = [
  {
    title: "Структура",
    score: 0,
    status: "Ожидает проверки",
  },
  {
    title: "Опыт",
    score: 0,
    status: "Ожидает проверки",
  },
  {
    title: "Навыки",
    score: 0,
    status: "Ожидает проверки",
  },
  {
    title: "ATS",
    score: 0,
    status: "Ожидает проверки",
  },
];

export function AnalyzeSidebar() {
  return (
    <aside className="space-y-6">
      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <p className="text-sm text-muted-foreground">Итоговая оценка</p>

        <div className="mt-5 flex items-end gap-2">
          <span className="text-6xl font-semibold text-foreground">—</span>
          <span className="pb-3 text-muted-foreground">/100</span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Оценка появится после запуска анализа. Сейчас резюме ещё не
          проверялось.
        </p>

        <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80">
          Запустить оценку
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <h2 className="text-xl font-medium text-foreground">Детализация</h2>

        <div className="mt-5 space-y-4">
          {resultPreview.map((item) => (
            <div key={item.title}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-foreground">{item.title}</span>
                <span className="text-muted-foreground">—</span>
              </div>

              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-foreground"
                  style={{ width: `${item.score}%` }}
                />
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                {item.status}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-muted-foreground" />

          <div>
            <h2 className="font-medium text-foreground">Важно</h2>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Оценка не заменяет рекрутера, но помогает быстро найти слабые
              места в резюме перед откликом.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}