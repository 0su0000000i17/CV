import Link from "next/link";
import { FileText, Plus, Sparkles } from "lucide-react";

const recentResumes = [
  {
    title: "Frontend Developer Resume.pdf",
    updatedAt: "Обновлено 2 дня назад",
  },
  {
    title: "Product Manager Resume.pdf",
    updatedAt: "Обновлено 5 дней назад",
  },
  {
    title: "Marketing Specialist Resume.pdf",
    updatedAt: "Обновлено 1 неделю назад",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-10">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Личный кабинет / Обзор
        </p>

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-normal tracking-tight text-foreground md:text-5xl">
              Обзор
            </h1>

            <p className="mt-4 max-w-2xl text-muted-foreground">
              Загружайте резюме, оценивайте слабые места и адаптируйте отклик
              под конкретную вакансию.
            </p>
          </div>

          <Link
            href="/dashboard/resumes"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
          >
            <Plus className="h-4 w-4" />
            Загрузить резюме
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Быстрый старт
          </p>

          <h2 className="text-xl font-medium text-foreground">
            Привет, Иван
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Начните с загрузки резюме. После этого можно будет оценить его и
            адаптировать под вакансию.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/dashboard/resumes"
              className="rounded-xl bg-foreground px-4 py-3 text-center text-sm font-medium text-background transition-colors hover:bg-foreground/80"
            >
              Загрузить резюме
            </Link>

            <Link
              href="/dashboard/adapt"
              className="rounded-xl border border-border px-4 py-3 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Адаптировать
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Лимиты
          </p>

          <h2 className="text-xl font-medium text-foreground">
            Адаптации в этом месяце
          </h2>

          <div className="mt-6 flex items-end gap-2">
            <span className="text-5xl font-semibold text-foreground">0</span>
            <span className="pb-2 text-muted-foreground">/ 10</span>
          </div>

          <div className="mt-5 h-2 rounded-full bg-muted">
            <div className="h-2 w-0 rounded-full bg-foreground" />
          </div>

          <Link
            href="/dashboard/billing"
            className="mt-6 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Улучшить тариф →
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6 md:col-span-2 xl:col-span-1">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Следующее действие
          </p>

          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-muted p-3">
              <Sparkles className="h-5 w-5 text-foreground" />
            </div>

            <div>
              <h2 className="text-xl font-medium text-foreground">
                Адаптация под вакансию
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Вставьте текст вакансии или ссылку, чтобы получить версию
                резюме под конкретный отклик.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card/60 p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-medium text-foreground">
              Недавние резюме
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Последние файлы, с которыми вы работали.
            </p>
          </div>

          <Link
            href="/dashboard/resumes"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Все резюме →
          </Link>
        </div>

        <div className="divide-y divide-border rounded-xl border border-border">
          {recentResumes.map((resume) => (
            <div
              key={resume.title}
              className="flex items-center gap-4 px-4 py-4"
            >
              <div className="rounded-xl bg-muted p-3">
                <FileText className="h-5 w-5 text-foreground" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {resume.title}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {resume.updatedAt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}