'use client';

import { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogEyebrow, DialogFooter, DialogTitle } from '@/components/ui/dialog';

const CONFIRMATION = 'УДАЛИТЬ';

export function DeleteAccountDialog(props: {
  open: boolean; pending: boolean; error: string;
  onCancel: () => void; onConfirm: () => void;
}) {
  const [value, setValue] = useState('');
  function cancel() {
    if (props.pending) return;
    setValue(''); props.onCancel();
  }
  return (
    <Dialog open={props.open} onOpenChange={(open) => { if (!open) cancel(); }}>
      <DialogContent hideClose className="max-w-lg border-red-500/20">
        <DialogEyebrow className="text-red-400">Опасное действие</DialogEyebrow>
        <DialogTitle>Удалить аккаунт?</DialogTitle>
        <DialogDescription asChild><div className="space-y-3">
          <p>Будут удалены профиль, загруженные резюме и сохранённые данные личного кабинета. Восстановить аккаунт после удаления нельзя.</p>
          <p>Если у аккаунта есть активный оплаченный тариф, удаление аккаунта прекращает доступ к сервису, но не является автоматической заявкой на возврат. По вопросам возврата нужно будет обратиться в поддержку.</p>
        </div></DialogDescription>
        <label className="mt-5 block text-sm font-medium text-foreground">Введите “{CONFIRMATION}”, чтобы подтвердить</label>
        <input value={value} onChange={(event) => setValue(event.target.value)} disabled={props.pending}
          className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-60" />
        {props.error ? <p className="mt-4 text-sm text-red-500" role="alert">{props.error}</p> : null}
        <DialogFooter>
          <button type="button" onClick={cancel} disabled={props.pending}
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">Отмена</button>
          <button type="button" onClick={props.onConfirm}
            disabled={props.pending || value.trim().toUpperCase() !== CONFIRMATION}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50">
            {props.pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {props.pending ? 'Удаляем...' : 'Удалить аккаунт'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
