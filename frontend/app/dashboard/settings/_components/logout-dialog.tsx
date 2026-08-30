import { LogOut } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogEyebrow, DialogFooter, DialogTitle } from '@/components/ui/dialog';

export function LogoutDialog(props: {
  open: boolean; pending: boolean; error: string;
  onCancel: () => void; onConfirm: () => void;
}) {
  return (
    <Dialog open={props.open} onOpenChange={(open) => { if (!open && !props.pending) props.onCancel(); }}>
      <DialogContent hideClose>
        <DialogEyebrow>Подтверждение выхода</DialogEyebrow>
        <DialogTitle>Выйти из аккаунта?</DialogTitle>
        <DialogDescription>Для следующего входа потребуется снова подтвердить email. Ваш профиль и загруженные резюме останутся сохранены.</DialogDescription>
        {props.error ? <p className="mt-4 text-sm text-red-500" role="alert">{props.error}</p> : null}
        <DialogFooter>
          <button type="button" onClick={props.onCancel} disabled={props.pending}
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">Отмена</button>
          <button type="button" onClick={props.onConfirm} disabled={props.pending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50">
            <LogOut className="h-4 w-4" />{props.pending ? 'Выходим...' : 'Да, выйти'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
