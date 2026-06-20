import Link from "next/link";
import { FileText } from "lucide-react";

const selectedResume = {
  id: "1",
  title: "Frontend Developer Resume.pdf",
  role: "Frontend Developer",
  status: "Оценка не пройдена",
};

export function SelectedResumeCard() {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-foreground">
            Выбранное резюме
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Именно этот файл будет адаптирован под вакансию.
          </p>
        </div>

        <Link
          href="/dashboard/resumes"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Сменить
        </Link>
      </div>

      <div className="flex items-start gap-4 rounded-2xl border border-border bg-background p-5">
        <div className="rounded-xl bg-muted p-3">
          <FileText className="h-5 w-5 text-foreground" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-base font-medium text-foreground">
            {selectedResume.title}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {selectedResume.role}
          </p>

          <div className="mt-3 inline-flex rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            {selectedResume.status}
          </div>
        </div>
      </div>
    </div>
  );
}