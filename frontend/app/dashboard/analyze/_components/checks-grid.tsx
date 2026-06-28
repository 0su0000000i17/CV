import { BarChart3, FileText, Search, ShieldCheck } from 'lucide-react';

const checks = [
  {
    title: 'Структура резюме',
    description: 'Проверим порядок блоков, читаемость и логику подачи.',
    icon: FileText,
    iconClassName: 'bg-blue-500/10 text-blue-300 ring-blue-500/20',
  },
  {
    title: 'Опыт и достижения',
    description: 'Оценим, насколько опыт описан через действия и результат.',
    icon: BarChart3,
    iconClassName: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
  },
  {
    title: 'Ключевые навыки',
    description: 'Проверим соответствие навыков IT-рынку и роли.',
    icon: Search,
    iconClassName: 'bg-violet-500/10 text-violet-300 ring-violet-500/20',
  },
  {
    title: 'ATS-совместимость',
    description: 'Посмотрим, насколько резюме удобно для автоматического отбора.',
    icon: ShieldCheck,
    iconClassName: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
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
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${item.iconClassName}`}>
                <Icon className="h-5 w-5" />
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
