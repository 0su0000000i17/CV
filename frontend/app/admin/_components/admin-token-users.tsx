import type { FormEvent } from 'react';
import { Coins, Loader2, Search } from 'lucide-react';
import type { AdminTokensState } from './use-admin-tokens';
import { formatAdminDate, formatAdminNumber } from './admin-token-utils';

export function AdminTokenUsers({ state }: { state: AdminTokensState }) {
  return <>
    <form onSubmit={(event) => { event.preventDefault(); state.submitSearch(); }} className="mt-5 flex gap-2">
      <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={state.search} onChange={(event) => state.setSearch(event.target.value)} placeholder="Поиск по email"
          className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/40" /></div>
      <button type="submit" className="inline-flex h-10 cursor-pointer items-center rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted">Найти</button>
    </form>
    <div className="mt-3 space-y-2">
      {state.usersQuery.isLoading ? <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Загружаем пользователей...</div> : null}
      {(state.usersQuery.data?.users ?? []).map((user) => <div key={user.id} className="rounded-xl border border-border bg-background px-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0 text-sm">
          <p className="truncate font-medium text-foreground">{user.email ?? user.id}</p>
          <p className="text-muted-foreground">Баланс: {formatAdminNumber(user.balance)} кредитов · зарегистрирован {formatAdminDate(user.createdAt)}</p></div>
          <button type="button" onClick={() => state.setGrantUserId(state.grantUserId === user.id ? null : user.id)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"><Coins className="h-3.5 w-3.5" />Начислить</button>
        </div>
        {state.grantUserId === user.id ? <GrantForm state={state} userId={user.id} /> : null}
      </div>)}
    </div>
  </>;
}
function GrantForm({ state, userId }: { state: AdminTokensState; userId: string }) {
  const submit = (event: FormEvent) => { event.preventDefault(); state.grant(userId); };
  return <form onSubmit={submit} className="mt-3 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row">
    <input value={state.amount} onChange={(event) => state.setAmount(event.target.value.replace(/[^\d]/g, ''))}
      placeholder="Сколько кредитов" className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/40 sm:w-40" />
    <input value={state.note} onChange={(event) => state.setNote(event.target.value)} placeholder="Комментарий (необязательно)"
      className="h-10 flex-1 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/40" />
    <button type="submit" disabled={state.grantMutation.isPending}
      className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-60">
      {state.grantMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Начислить</button>
  </form>;
}
