'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { removeAccount } from '@/src/shared/api/account';
import { supabase } from '@/src/shared/lib/supabase/client';

export function useAccountActions() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const finish = () => {
    queryClient.clear();
    router.replace('/');
    router.refresh();
  };
  const logout = async () => {
    setIsLoggingOut(true); setLogoutError('');
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) { setLogoutError(error.message); setIsLoggingOut(false); return; }
    finish();
  };
  const deleteAccount = async () => {
    setIsDeleting(true); setDeleteError('');
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    if (!accessToken) {
      setDeleteError('Сессия не найдена. Войдите в аккаунт повторно.');
      setIsDeleting(false); return;
    }
    try {
      await removeAccount(accessToken);
      await supabase.auth.signOut({ scope: 'global' });
      finish();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Не удалось удалить аккаунт.');
      setIsDeleting(false);
    }
  };
  return {
    logoutOpen, setLogoutOpen, deleteOpen, setDeleteOpen,
    isLoggingOut, isDeleting, logoutError, deleteError,
    openLogout: () => { setLogoutError(''); setLogoutOpen(true); },
    openDelete: () => { setDeleteError(''); setDeleteOpen(true); },
    logout, deleteAccount,
  };
}
