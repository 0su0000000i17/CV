import { CheckCircle2, Lightbulb } from "lucide-react";

const recommendations = [
  "Добавим конкретные рекомендации по каждому блоку резюме.",
  "Покажем слабые места и объясним, как их усилить.",
  "Сохраним результат анализа в истории резюме.",
];

export function FutureResultCard() {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="mb-6 flex items-start gap-4">
        <div className="rounded-xl bg-muted p-3">
          <Lightbulb className="h-5 w-5 text-foreground" />
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">
            Что появится после оценки
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Пока это моковый экран, но логика уже соответствует будущей
            бизнес-логике продукта.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((item) => (
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
    </div>
  );
}