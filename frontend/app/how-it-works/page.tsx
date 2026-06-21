import Link from "next/link";


type MetricStatus = "good" | "medium" | "needs work";

const metrics: { label: string; status: MetricStatus }[] = [
  { label: "Positioning", status: "good" },
  { label: "Role fit", status: "medium" },
  { label: "ATS", status: "needs work" },
  { label: "Evidence", status: "good" },
];

const statusColor: Record<MetricStatus, string> = {
  good: "text-emerald-500",
  medium: "text-yellow-500",
  "needs work": "text-red-500",
};

export default function HowItWorksPage() {
  const steps = [
    {
      number: "01",
      title: "Загрузи резюме",
      description:
        "Добавь PDF или DOCX из личного кабинета. Файл остаётся привязан к твоему аккаунту и используется для анализа.",
    },
    {
      number: "02",
      title: "Сервис извлечёт содержание",
      description:
        "Backend преобразует резюме в текстовый формат, чтобы анализировать не картинку файла, а реальное содержание: опыт, роли, навыки и структуру.",
    },
    {
      number: "03",
      title: "AI найдёт сильные места и риски",
      description:
        "Модель помогает выделить факты, red flags, ATS-проблемы и зоны улучшения. Финальную оценку считает backend по собственной рубрике.",
    },
    {
      number: "04",
      title: "Получишь понятный результат",
      description:
        "В личном кабинете появится итоговая оценка, детализация по метрикам и рекомендации, что стоит усилить перед откликом.",
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1">
        <p className="mb-8 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Как это работает / How it works
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_auto] lg:gap-12">

          <div className="space-y-8">
            <h1 className="text-4xl font-normal leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Проверь резюме <br /> 
              <span className="font-medium text-foreground">перед откликом</span>
            </h1>

            <p className="max-w-2xl text-base font-light leading-relaxed tracking-tight text-muted-foreground md:text-lg">
              CVPro анализирует резюме как первичный HR-скан: оценивает
              структуру, релевантность опыта, доказательность, ATS-совместимость
              и риски, которые могут мешать отклику.
            </p>

            <Link
              href="/dashboard/analyze"
              className="inline-block rounded-xl bg-emerald-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              Проверить резюме
            </Link>


            <div className="mt-12 space-y-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-sm font-medium text-muted-foreground">
                      {step.number}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="mt-1 h-12 w-px bg-border/60" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-foreground sm:text-xl">
                      {step.title}
                    </h3>
                    <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>


          <div className="flex flex-col items-start justify-start gap-6 pt-1 lg:pt-0">
            <div className="w-full max-w-[260px] rounded-2xl border border-border bg-background p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Resume analysis
                </p>
                <span className="text-xs font-medium text-emerald-500">● Live</span>
              </div>

              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-semibold text-foreground">78</span>
                <span className="pb-1 text-sm text-muted-foreground">/ 100</span>
              </div>

              <div className="mt-4 space-y-2">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex items-center justify-between border-b border-border/60 py-1.5 last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">
                      {metric.label}
                    </span>
                    <span
                      className={`text-sm font-medium ${statusColor[metric.status]}`}
                    >
                      {metric.status === "good" && "● Good"}
                      {metric.status === "medium" && "● Medium"}
                      {metric.status === "needs work" && "● Needs work"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                  ATS
                </span>
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                  HR scan
                </span>
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                  Score
                </span>
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                  Red flags
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
