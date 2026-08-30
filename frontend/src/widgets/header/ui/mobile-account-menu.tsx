import { useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { supabase } from '@/src/shared/lib/supabase/client';

type Props = {
  authenticated: boolean;
  email: string;
  fullName: string;
  onNavigate: () => void;
};

export function MobileAccountMenu({ authenticated, email, fullName, onNavigate }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  async function signOut() {
    onNavigate();
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) {
      console.error(error);
      return;
    }
    queryClient.clear();
    router.replace('/');
    router.refresh();
  }

  if (!authenticated) {
    return (
      <Link href="/login" onClick={onNavigate} className="block w-full rounded-xl bg-brand-500 px-4 py-3 text-center text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-[background-color,transform] hover:bg-brand-600 active:scale-[0.99]">
        Войти
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <p className="truncate font-medium text-foreground">{fullName}</p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{email}</p>
      <Link href="/dashboard/settings" onClick={onNavigate} className="mt-4 block rounded-xl border border-white/10 px-4 py-2.5 text-center text-sm font-medium text-foreground transition-[background-color,border-color] hover:border-white/20 hover:bg-white/[0.045]">
        Настройки профиля
      </Link>
      <button type="button" onClick={signOut} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.045] hover:text-foreground">
        <LogOut className="h-4 w-4" />Выйти
      </button>
    </div>
  );
}
