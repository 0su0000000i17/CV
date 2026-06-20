import Link from "next/link";

export function ResumeNotFoundState() {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-10 text-center">
      <h1 className="text-2xl font-medium text-foreground">
        Резюме не найдено
      </h1>

      <p className="mt-3 text-sm text-muted-foreground">
        Возможно, файл был удалён или у вас нет доступа к этому резюме.
      </p>

      <Link
        href="/dashboard/resumes"
        className="mt-6 inline-flex rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
      >
        Вернуться к списку
      </Link>
    </div>
  );
}