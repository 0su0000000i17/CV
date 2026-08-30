import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogEyebrow,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';

type DeleteResumeDialogProps = {
  open: boolean;
  resumeTitle: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteResumeDialog({
  open,
  resumeTitle,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteResumeDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open && !isDeleting) onCancel();
      }}
    >
      <DialogContent hideClose>
        <DialogEyebrow>Удаление резюме</DialogEyebrow>
        <DialogTitle>Удалить файл?</DialogTitle>
        <DialogDescription>
          Резюме{' '}
          <span className="font-medium text-foreground">{resumeTitle}</span>{' '}
          будет удалено из личного кабинета и хранилища. Это действие нельзя
          отменить.
        </DialogDescription>

        <DialogFooter>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-foreground transition-[background-color,border-color] hover:border-white/20 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Отмена
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? 'Удаляем...' : 'Удалить'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
