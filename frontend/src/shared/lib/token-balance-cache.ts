import type { QueryClient } from '@tanstack/react-query';

import type { TokenSummaryResponse } from '@/src/shared/api/billing';

/**
 * Every component that shows the credit balance (nav sidebar/mobile menu,
 * mini-profile popover, settings, billing page) reads it from the SAME
 * `['token-summary']` query, so writing a fresh balance into that one cache
 * entry is all it takes to update every one of them at once - no separate
 * event bus needed. Call this the moment a paid action's response reveals
 * the post-charge balance (see the `onQueued` callbacks threaded through the
 * queue-based API clients), so the UI reflects the deduction as soon as the
 * server has actually applied it, not only once the whole AI task finishes.
 */
export function applyTokenBalanceUpdate(queryClient: QueryClient, balance: number | undefined) {
  if (typeof balance !== 'number') return;

  queryClient.setQueryData<TokenSummaryResponse>(['token-summary'], (current) =>
    current ? { ...current, balance } : current
  );
}
