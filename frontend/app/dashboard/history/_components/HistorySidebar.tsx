import Link from "next/link";
import { Clock, FileText } from "lucide-react";

const versions = [
  {
    title: "Frontend Developer Resume — React Version",
    resume: "Frontend Developer Resume.pdf",
    date: "15 июня",
    status: "Адаптация",
  },
  {
    title: "Product Manager Resume — Анализ",
    resume: "Product Manager Resume.pdf",
    date: "13 июня",
    status: "Оценка",
  },
  {
    title: "Marketing Specialist Resume — Original",
    resume: "Marketing Specialist Resume.pdf",
    date: "10 июня",
    status: "Оригинал",
  },
];

export function HistorySidebar() {
  return (
    <aside className="space-y-6">
      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="mb-5 w-fit rounded-xl bg-muted p-3">
          <Clock className="h-5 w-5 text-foreground" />
        </div>

        <h2 className="text-xl font-medium text-foreground">Быстрый доступ</h2>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Позже здесь можно будет быстро открыть последнюю адаптацию, последний
          анализ или скачанный файл.
        </p>

        <Link
          href="/dashboard/resumes"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
        >
          Перейти к резюме
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <h2 className="text-xl font-medium text-foreground">
          Последние версии
        </h2>

        <div className="mt-5 space-y-3">
          {versions.map((version) => (
            <div
              key={version.title}
              className="rounded-2xl border border-border bg-background p-4"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-muted p-3">
                  <FileText className="h-4 w-4 text-foreground" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {version.title}
                  </p>

                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {version.resume}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
                      {version.status}
                    </span>

                    <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
                      {version.date}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}