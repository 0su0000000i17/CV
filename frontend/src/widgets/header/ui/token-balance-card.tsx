'use client';

import Link from 'next/link';
import { ArrowUpRight, Coins } from 'lucide-react';

import { useAuth } from '@/src/shared/hooks/use-auth';
import { useTokenSummaryQuery } from '@/src/shared/hooks/use-token-summary-query';
import { RollingNumber } from '@/src/shared/ui/rolling-number';

type Props = {
  className?: string;
  onNavigate?: () => void;
};

/**
 * Self-contained: reads auth + token balance itself, so every call site just
 * drops it in without threading accessToken through props. There is no
 * ongoing subscription tier in the token-pack model - "Тариф" is the name of
 * the most recently succeeded purchase (see getCurrentPlanLabel on the
 * backend), "Free" until the first purchase.
 */
export function TokenBalanceCard({ className, onNavigate }: Props) {
  const { accessToken } = useAuth();
  const { data, isLoading } = useTokenSummaryQuery(accessToken);
  const planName = data?.currentPlan ?? 'Free';

  return (
    <div className={className}>
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.045] text-white/55">
          <Coins className="h-3.5 w-3.5" strokeWidth={1.7} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[0.68rem] uppercase tracking-[0.12em] text-white/30">
              {planName}
            </p>
            <p className="whitespace-nowrap text-sm font-medium text-white/85">
              {isLoading || data === undefined ? (
                '…'
              ) : (
                <RollingNumber value={data.balance} />
              )}
            </p>
          </div>
          <p className="mt-0.5 text-[0.68rem] text-white/30">
            доступно кредитов
          </p>
        </div>
      </div>

      <Link
        href="/dashboard/billing"
        onClick={onNavigate}
        className="mt-2.5 flex items-center justify-between rounded-lg px-1 py-1 text-[0.72rem] font-medium text-white/45 transition-colors hover:text-white/80"
      >
        Пополнить
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
