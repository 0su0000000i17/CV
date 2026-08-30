import { Trash2 } from 'lucide-react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import type { JobApplication } from '@/src/shared/api/applications';
import { MutationError } from './application-ui';

export function DeleteApplicationDialog({
  target,
  pending,
  error,
  onOpenChange,
  onConfirm,
}: {
  target: JobApplication | null;
  pending: boolean;
  error: unknown;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="max-w-md rounded-xl">
        <div className="grid h-11 w-11 place-items-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-500">
          <Trash2 className="h-5 w-5" />
        </div>
        <DialogTitle>Удалить запись?</DialogTitle>
        <DialogDescription>
          «{target?.vacancy_title}» будет удалена из трекера. Это действие нельзя отменить.
        </DialogDescription>
        {error ? <MutationError error={error} fallback="Не удалось удалить запись" /> : null}
        <DialogFooter>
          <DialogClose asChild>
            <button
              type="button"
              disabled={pending}
              className="h-10 cursor-pointer rounded-lg border border-foreground/12 px-4 text-sm text-foreground/65 hover:bg-foreground/[0.05] disabled:opacity-45"
            >
              Отмена
            </button>
          </DialogClose>
          <button
            type="button"
            disabled={!target || pending}
            onClick={onConfirm}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-45"
          >
            <Trash2 className="h-4 w-4" />
            {pending ? 'Удаляем...' : 'Удалить'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
