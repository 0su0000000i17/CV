import { BarChart3, FileText, Search, ShieldCheck } from "lucide-react";

const checks = [
  {
    title: "Структура резюме",
    description: "Проверим порядок блоков, читаемость и логику подачи.",
    icon: FileText,
  },
  {
    title: "Опыт и достижения",
    description: "Оценим, насколько опыт описан через действия и результат.",
    icon: BarChart3,
  },
  {
    title: "Ключевые навыки",
    description: "Проверим соответствие навыков IT-рынку и роли.",
    icon: Search,
  },
  {
    title: "ATS-совместимость",
    description: "Посмотрим, насколько резюме удобно для автоматического отбора.",
    icon: ShieldCheck,
  },
];

export function ChecksGrid() {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <h2 className="text-xl font-medium text-foreground">Что проверим</h2>

      <p className="mt-1 text-sm text-muted-foreground">
        Оценка будет состоять из нескольких блоков, чтобы результат был не
        просто числом, а понятной картой улучшений.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {checks.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-background p-5"
            >
              <div className="mb-4 w-fit rounded-xl bg-muted p-3">
                <Icon className="h-5 w-5 text-foreground" />
              </div>

              <h3 className="font-medium text-foreground">{item.title}</h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}