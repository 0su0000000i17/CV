'use client';

import { useRouter } from 'next/navigation';
import { Loader2, LogOut, ShieldAlert, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { removeAccount } from '@/src/shared/api/account';
import { supabase } from '@/src/shared/lib/supabase/client';

const DELETE_CONFIRMATION_TEXT = 'УДАЛИТЬ';

export function AccountSettings() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setErrorMessage('');

    const { error } = await supabase.auth.signOut({ scope: 'local' });

    if (error) {
      setErrorMessage(error.message);
      setIsLoggingOut(false);
      return;
    }

    queryClient.clear();
    router.replace('/');
    router.refresh();
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    setDeleteErrorMessage('');

    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;

    if (!accessToken) {
      setDeleteErrorMessage('Сессия не найдена. Войдите в аккаунт повторно.');
      setIsDeletingAccount(false);
      return;
    }

    try {
      await removeAccount(accessToken);
      await supabase.auth.signOut({ scope: 'global' });
      queryClient.clear();
      router.replace('/');
      router.refresh();
    } catch (error) {
      setDeleteErrorMessage(
        error instanceof Error ? error.message : 'Не удалось удалить аккаунт.'
      );
      setIsDeletingAccount(false);
    }
  };

  return (
    <>
      <div className="space-y-5">
        <section className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-red-500/10 p-2.5">
              <ShieldAlert className="h-4 w-4 text-red-500" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-medium text-foreground">
                Сессия
              </h2>

              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Выход завершит текущую сессию только на этом устройстве.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setErrorMessage('');
              setDialogOpen(true);
            }}
            className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 px-4 text-sm font-medium text-red-500 transition-colors hover:bg-red-500 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Выйти из аккаунта
          </button>
        </section>

        <section className="rounded-2xl border border-border bg-card/60 p-5">
          <p className="text-sm font-medium text-foreground">
            Безопасность данных
          </p>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Резюме, профиль и данные личного кабинета хранятся в вашем аккаунте.
            Если аккаунт удалить, восстановить эти данные будет нельзя.
          </p>
        </section>

        <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-red-500/10 p-2.5">
              <Trash2 className="h-4 w-4 text-red-500" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-medium text-foreground">
                Удаление аккаунта
              </h2>

              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Удалим профиль, загруженные резюме и сохранённые данные личного
                кабинета. Действие нельзя отменить.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setDeleteErrorMessage('');
              setDeleteDialogOpen(true);
            }}
            className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 text-sm font-medium text-white transition-colors hover:bg-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Удалить аккаунт
          </button>
        </section>
      </div>

      {dialogOpen ? (
        <LogoutDialog
          isLoggingOut={isLoggingOut}
          errorMessage={errorMessage}
          onCancel={() => setDialogOpen(false)}
          onConfirm={handleLogout}
        />
      ) : null}

      {deleteDialogOpen ? (
        <DeleteAccountDialog
          isDeleting={isDeletingAccount}
          errorMessage={deleteErrorMessage}
          onCancel={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteAccount}
        />
      ) : null}
    </>
  );
}

type LogoutDialogProps = {
  isLoggingOut: boolean;
  errorMessage: string;
  onCancel: () => void;
  onConfirm: () => void;
};

function LogoutDialog({
  isLoggingOut,
  errorMessage,
  onCancel,
  onConfirm,
}: LogoutDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoggingOut) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLoggingOut, onCancel]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget && !isLoggingOut) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl"
      >
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Подтверждение выхода
        </p>

        <h2
          id="logout-dialog-title"
          className="mt-3 text-2xl font-medium text-foreground"
        >
          Выйти из аккаунта?
        </h2>

        <p
          id="logout-dialog-description"
          className="mt-3 text-sm leading-relaxed text-muted-foreground"
        >
          Для следующего входа потребуется снова подтвердить email. Ваш профиль
          и загруженные резюме останутся сохранены.
        </p>

        {errorMessage ? (
          <p className="mt-4 text-sm text-red-500" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isLoggingOut}
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Отмена
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? 'Выходим...' : 'Да, выйти'}
          </button>
        </div>
      </div>
    </div>
  );
}

type DeleteAccountDialogProps = {
  isDeleting: boolean;
  errorMessage: string;
  onCancel: () => void;
  onConfirm: () => void;
};

function DeleteAccountDialog({
  isDeleting,
  errorMessage,
  onCancel,
  onConfirm,
}: DeleteAccountDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const [confirmation, setConfirmation] = useState('');
  const canConfirm = confirmation.trim().toUpperCase() === DELETE_CONFIRMATION_TEXT;

  useEffect(() => {
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDeleting, onCancel]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-dialog-title"
        aria-describedby="delete-account-dialog-description"
        className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-background p-6 shadow-2xl"
      >
        <p className="text-xs font-medium uppercase tracking-widest text-red-400">
          Опасное действие
        </p>

        <h2
          id="delete-account-dialog-title"
          className="mt-3 text-2xl font-medium text-foreground"
        >
          Удалить аккаунт?
        </h2>

        <div
          id="delete-account-dialog-description"
          className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground"
        >
          <p>
            Будут удалены профиль, загруженные резюме и сохранённые данные
            личного кабинета. Восстановить аккаунт после удаления нельзя.
          </p>

          <p>
            Если у аккаунта есть активный оплаченный тариф, удаление аккаунта
            прекращает доступ к сервису, но не является автоматической заявкой
            на возврат. По вопросам возврата нужно будет обратиться в поддержку.
          </p>
        </div>

        <label className="mt-5 block text-sm font-medium text-foreground">
          Введите “{DELETE_CONFIRMATION_TEXT}”, чтобы подтвердить
        </label>

        <input
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          disabled={isDeleting}
          className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        />

        {errorMessage ? (
          <p className="mt-4 text-sm text-red-500" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
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
            disabled={isDeleting || !canConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isDeleting ? 'Удаляем...' : 'Удалить аккаунт'}
          </button>
        </div>
      </div>
    </div>
  );
}
