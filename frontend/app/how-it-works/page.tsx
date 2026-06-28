import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Target,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type MetricStatus = 'good' | 'medium' | 'needsWork';

type Step = {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const steps: Step[] = [
  {
    number: '01',
    title: 'Загрузите резюме',
    description:
      'Добавьте PDF или DOCX. CVPro прочитает содержание резюме и сохранит его в личном кабинете.',
    icon: FileText,
  },
  {
    number: '02',
    title: 'Получите оценку',
    description:
      'Сервис проверит структуру, опыт, навыки, ATS-совместимость и места, которые стоит усилить перед откликом.',
    icon: BarChart3,
  },
  {
    number: '03',
    title: 'Разберите результат',
    description:
      'В отчёте будет общий score, детализация по блокам и конкретные рекомендации без технической терминологии.',
    icon: CheckCircle2,
  },
  {
    number: '04',
    title: 'Адаптируйте под вакансию',
    description:
      'Вставьте описание вакансии — CVPro подготовит новую версию резюме под требования работодателя.',
    icon: Target,
  },
  {
    number: '05',
    title: 'Скачайте готовый файл',
    description:
      'Исходное резюме останется без изменений. Новую версию можно проверить, отредактировать и скачать.',
    icon: ShieldCheck,
  },
];

const metrics: { label: string; value: string; status: MetricStatus }[] = [
  { label: 'Структура', value: 'Хорошо', status: 'good' },
  { label: 'Опыт', value: 'Средне', status: 'medium' },
  { label: 'ATS', value: 'Усилить', status: 'needsWork' },
  { label: 'Доказательность', value: 'Хорошо', status: 'good' },
];

const statusColor: Record<MetricStatus, string> = {
  good: 'text-emerald-500',
  medium: 'text-orange-400',
  needsWork: 'text-red-500',
};

const resultItems = [
  'Оценка резюме по понятным критериям',
  'Сильные стороны и зоны роста',
  'ATS-проблемы и недостающие ключевые слова',
  'Адаптация под конкретную вакансию',
  'Сопроводительное письмо в нужном тоне',
];

export default function HowItWorksPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1">
        <p className="mb-8 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Как это работает / How it works
        </p>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
          <div>
            <h1 className="max-w-4xl text-4xl font-normal leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              От резюме до готового отклика{' '}
              <span className="font-medium text-foreground">
                в одном кабинете
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base font-light leading-relaxed tracking-tight text-muted-foreground md:text-lg">
              CVPro помогает понять, насколько резюме готово к отклику, что в
              нём стоит усилить и как адаптировать его под конкретную вакансию.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/dashboard/analyze"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
              >
                Проверить резюме
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/dashboard/adapt"
                className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Адаптировать под вакансию
              </Link>
            </div>

            <div className="mt-12 space-y-6">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={step.number} className="flex gap-5">
                    <div className="flex flex-col items-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-sm font-medium text-muted-foreground">
                        {step.number}
                      </div>

                      {index < steps.length - 1 ? (
                        <div className="mt-2 h-14 w-px bg-border/60" />
                      ) : null}
                    </div>

                    <div className="min-w-0 pb-2">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20">
                        <Icon className="h-4 w-4" />
                      </div>

                      <h2 className="text-lg font-medium text-foreground sm:text-xl">
                        {step.title}
                      </h2>

                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-card/60 p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Пример оценки
                </p>

                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500">
                  Готово
                </span>
              </div>

              <div className="mt-5 flex items-end gap-1">
                <span className="text-5xl font-semibold tracking-tight text-foreground">
                  78
                </span>

                <span className="pb-1.5 text-sm text-muted-foreground">
                  / 100
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Резюме можно отправлять, но есть блоки, которые стоит доработать
                перед откликом.
              </p>

              <div className="mt-5 space-y-2">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex items-center justify-between border-b border-border/60 py-2 last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">
                      {metric.label}
                    </span>

                    <span
                      className={`text-sm font-medium ${statusColor[metric.status]}`}
                    >
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background p-5">
              <h2 className="text-lg font-medium text-foreground">
                Что вы получите
              </h2>

              <div className="mt-4 space-y-3">
                {resultItems.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card/60 p-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                CVPro не заменяет ваше решение. Сервис помогает быстрее увидеть
                слабые места резюме и подготовить более точный отклик.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
