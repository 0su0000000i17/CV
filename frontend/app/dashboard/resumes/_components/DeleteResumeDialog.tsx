type DeleteResumeDialogProps = {
  resumeTitle: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteResumeDialog({
  resumeTitle,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteResumeDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Удаление резюме
        </p>

        <h2 className="mt-3 text-2xl font-medium text-foreground">
          Удалить файл?
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Резюме{" "}
          <span className="font-medium text-foreground">{resumeTitle}</span>{" "}
          будет удалено из личного кабинета и хранилища. Это действие нельзя
          отменить.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Отмена
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "Удаляем..." : "Удалить"}
          </button>
        </div>
      </div>
    </div>
  );
}