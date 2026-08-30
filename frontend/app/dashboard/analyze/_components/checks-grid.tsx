import { BarChart3, FileText, Search, ShieldCheck } from 'lucide-react';

const checks = [
  {
    title: 'Структура резюме',
    description: 'Проверим порядок блоков, читаемость и логику подачи.',
    icon: FileText,
  },
  {
    title: 'Опыт и достижения',
    description: 'Оценим, насколько опыт описан через действия и результат.',
    icon: BarChart3,
  },
  {
    title: 'Ключевые навыки',
    description: 'Проверим соответствие навыков IT-рынку и роли.',
    icon: Search,
  },
  {
    title: 'ATS-совместимость',
    description: 'Посмотрим, насколько резюме удобно для автоматического отбора.',
    icon: ShieldCheck,
  },
];

export function ChecksGrid() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.018] p-5 sm:p-6">
      <h2 className="text-xl font-medium tracking-[-0.025em] text-foreground">Что проверим</h2>

      <p className="mt-1 text-sm leading-snug text-muted-foreground sm:leading-normal">
        Оценка будет состоять из нескольких блоков, чтобы результат был не
        просто числом, а понятной картой улучшений.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {checks.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.015] p-4 transition-[background-color,border-color] hover:border-white/15 hover:bg-white/[0.028] sm:p-5"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-white/55">
                <Icon className="h-4 w-4" strokeWidth={1.6} />
              </div>

              <h3 className="font-medium text-foreground">{item.title}</h3>

              <p className="mt-1.5 text-sm leading-normal text-muted-foreground sm:mt-2 sm:leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
