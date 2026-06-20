import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Download,
  FileText,
  History,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";

const resume = {
  id: "1",
  title: "Frontend Developer Resume.pdf",
  role: "Frontend Developer",
  uploadedAt: "12 июня 2026",
  updatedAt: "Обновлено 2 дня назад",
  fileType: "PDF",
  fileSize: "248 KB",
  analysisStatus: "not_started",
  adaptations: 0,
};

const versions = [
  {
    title: "Оригинальная версия",
    description: "Файл, который был загружен пользователем",
    date: "12 июня 2026",
    status: "original",
  },
];

const activity = [
  {
    title: "Резюме загружено",
    description: "Добавлена оригинальная версия файла",
    date: "12 июня 2026",
  },
  {
    title: "Ожидает анализа",
    description: "Запустите оценку, чтобы получить рекомендации",
    date: "сейчас",
  },
];

function getAnalysisData(status: string) {
  switch (status) {
    case "not_started":
      return {
        title: "Анализ не пройден",
        description:
          "Запустите оценку резюме, чтобы увидеть сильные и слабые места.",
      };

    case "completed":
      return {
        title: "78/100",
        description: "Анализ актуален для текущей версии резюме.",
      };

    case "needs_update":
      return {
        title: "Требует обновления",
        description:
          "Резюме изменилось после последнего анализа. Запустите проверку повторно.",
      };

    default:
      return {
        title: "Неизвестно",
        description: "",
      };
  }
}

export default function ResumeDetailsPage() {
  const analysis = getAnalysisData(resume.analysisStatus);

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/resumes"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к резюме
        </Link>

        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Личный кабинет / Резюме
        </p>

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="max-w-3xl text-4xl font-normal tracking-tight text-foreground md:text-5xl">
              {resume.title}
            </h1>

            <p className="mt-4 text-muted-foreground">
              {resume.role} · {resume.fileType} · {resume.fileSize}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <Download className="h-4 w-4" />
              Скачать
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <Trash2 className="h-4 w-4" />
              Удалить
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="mb-4 rounded-xl bg-muted p-3 w-fit">
            <FileText className="h-5 w-5 text-foreground" />
          </div>

          <p className="text-sm text-muted-foreground">Статус файла</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">Готово</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {resume.updatedAt}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="mb-4 rounded-xl bg-muted p-3 w-fit">
            <Sparkles className="h-5 w-5 text-foreground" />
          </div>

          <p className="text-sm text-muted-foreground">Статус анализа</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {analysis.title}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {analysis.description}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="mb-4 rounded-xl bg-muted p-3 w-fit">
            <History className="h-5 w-5 text-foreground" />
          </div>

          <p className="text-sm text-muted-foreground">Адаптаций</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {resume.adaptations}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Пока нет созданных версий под вакансии
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-medium text-foreground">
                Что можно сделать дальше
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Выберите следующий шаг для этого резюме.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Link
              href={`/dashboard/analyze?resumeId=${resume.id}`}
              className="rounded-2xl border border-border p-5 transition-colors hover:bg-muted"
            >
              <Sparkles className="mb-4 h-5 w-5 text-foreground" />
              <h3 className="font-medium text-foreground">Запустить анализ</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Получить оценку структуры, опыта, навыков и формулировок.
              </p>
            </Link>

            <Link
              href={`/dashboard/adapt?resumeId=${resume.id}`}
              className="rounded-2xl border border-border p-5 transition-colors hover:bg-muted"
            >
              <RotateCcw className="mb-4 h-5 w-5 text-foreground" />
              <h3 className="font-medium text-foreground">
                Создать адаптацию
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Подготовить отдельную версию резюме под конкретную вакансию.
              </p>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="text-xl font-medium text-foreground">
            Информация о файле
          </h2>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-border pb-3">
              <span className="text-muted-foreground">Дата загрузки</span>
              <span className="text-foreground">{resume.uploadedAt}</span>
            </div>

            <div className="flex justify-between gap-4 border-b border-border pb-3">
              <span className="text-muted-foreground">Тип файла</span>
              <span className="text-foreground">{resume.fileType}</span>
            </div>

            <div className="flex justify-between gap-4 border-b border-border pb-3">
              <span className="text-muted-foreground">Размер</span>
              <span className="text-foreground">{resume.fileSize}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Специализация</span>
              <span className="text-foreground">{resume.role}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="text-xl font-medium text-foreground">
            История версий
          </h2>

          <div className="mt-6 space-y-3">
            {versions.map((version) => (
              <div
                key={version.title}
                className="rounded-2xl border border-border p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-muted p-3">
                    <FileText className="h-5 w-5 text-foreground" />
                  </div>

                  <div>
                    <p className="font-medium text-foreground">
                      {version.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {version.description}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {version.date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="text-xl font-medium text-foreground">
            История действий
          </h2>

          <div className="mt-6 space-y-4">
            {activity.map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>

                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}