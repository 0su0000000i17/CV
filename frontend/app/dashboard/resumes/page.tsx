import Link from "next/link";
import { Download, FileText, MoreHorizontal, Plus, Trash2 } from "lucide-react";

const resumes = [
  {
    id: "1",
    title: "Frontend Developer Resume.pdf",
    role: "Frontend Developer",
    analysisStatus: "not_started",
    updatedAt: "Обновлено 2 дня назад",
    adaptations: 0,
  },
  {
    id: "2",
    title: "Product Manager Resume.pdf",
    role: "Product Manager",
    analysisStatus: "completed",
    score: 78,
    updatedAt: "Обновлено 5 дней назад",
    adaptations: 1,
  },
  {
    id: "3",
    title: "Marketing Specialist Resume.pdf",
    role: "Marketing Specialist",
    analysisStatus: "needs_update",
    updatedAt: "Обновлено 1 неделю назад",
    adaptations: 5,
  },
];

function getAnalysisData(resume: any) {
  switch (resume.analysisStatus) {
    case "not_started":
      return {
        title: "Не пройдена",
        subtitle: "Запустите анализ",
      };

    case "completed":
      return {
        title: `${resume.score}/100`,
        subtitle: "Актуальна",
      };

    case "needs_update":
      return {
        title: "Требует обновления",
        subtitle: "Резюме изменилось",
      };

    default:
      return {
        title: "Неизвестно",
        subtitle: "",
      };
  }
}

export default function ResumesPage() {
  return (
    <div>
      <div className="mb-10">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Личный кабинет / Мои резюме
        </p>

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-normal tracking-tight text-foreground md:text-5xl">
              Мои резюме
            </h1>

            <p className="mt-4 max-w-2xl text-muted-foreground">
              Храните несколько версий резюме, отслеживайте статус анализа и
              открывайте нужный файл для работы.
            </p>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80">
            <Plus className="h-4 w-4" />
            Загрузить резюме
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <p className="text-sm text-muted-foreground">Всего резюме</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">3</p>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <p className="text-sm text-muted-foreground">Проанализировано</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">1</p>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <p className="text-sm text-muted-foreground">Адаптаций</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">6</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/60">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-xl font-medium text-foreground">
              Загруженные файлы
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Откройте резюме, чтобы посмотреть версии, анализ и историю работы
              с файлом.
            </p>
          </div>
        </div>

        <div className="divide-y divide-border">
          {resumes.map((resume) => {
            const analysis = getAnalysisData(resume);

            return (
              <div
                key={resume.id}
                className="grid grid-cols-1 gap-5 px-6 py-5 transition-colors hover:bg-muted/40 xl:grid-cols-[1fr_220px_220px]"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="rounded-xl bg-muted p-3">
                    <FileText className="h-5 w-5 text-foreground" />
                  </div>

                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/resumes/${resume.id}`}
                      className="truncate text-base font-medium text-foreground hover:underline"
                    >
                      {resume.title}
                    </Link>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {resume.role}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
                        {resume.updatedAt}
                      </span>

                      <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
                        {resume.adaptations} адаптаций
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Статус анализа
                  </p>

                  <div className="mt-3">
                    <p className="text-xl font-semibold text-foreground">
                      {analysis.title}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {analysis.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 xl:justify-end">
                  <Link
                    href={`/dashboard/resumes/${resume.id}`}
                    className="rounded-xl border border-border px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    Открыть
                  </Link>

                  <button className="rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <Download className="h-4 w-4" />
                  </button>

                  <button className="rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <button className="rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}