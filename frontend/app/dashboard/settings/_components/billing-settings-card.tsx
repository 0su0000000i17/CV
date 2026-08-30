import Link from 'next/link';
import { WalletCards } from 'lucide-react';
import { useTokenSummaryQuery } from '@/src/shared/hooks/use-token-summary-query';
import { RollingNumber } from '@/src/shared/ui/rolling-number';

export function BillingSettingsCard({ accessToken }: { accessToken: string }) {
  const query = useTokenSummaryQuery(accessToken);
  const planName = query.data?.currentPlan ?? 'Free';
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.018] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-white/55"><WalletCards className="h-4 w-4" /></div>
          <div><h2 className="text-lg font-medium text-foreground">Текущий план</h2>
            <p className="mt-1 text-sm text-muted-foreground">Текущий режим и доступные действия.</p></div>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5">
          <span className="text-xs text-muted-foreground">Текущий тариф</span>
          <span className="rounded-full border border-white/15 bg-white/[0.05] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white/70">{planName}</span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
          <p className="text-sm text-muted-foreground">Кредиты</p>
          <p className="mt-1 text-lg font-medium text-foreground">
            {query.isLoading || query.data === undefined ? '…' : <RollingNumber value={query.data.balance} />}
          </p>
        </div>
        <Link href="/dashboard/billing" className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm font-medium text-foreground transition-[background-color,border-color] hover:border-white/20 hover:bg-white/[0.035]">Управлять тарифом</Link>
      </div>
    </section>
  );
}
