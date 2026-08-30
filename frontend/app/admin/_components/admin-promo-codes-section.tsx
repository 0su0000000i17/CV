'use client';

import { Gift } from 'lucide-react';
import { AdminPromoForm } from './admin-promo-form';
import { AdminPromoTable } from './admin-promo-table';
import { useAdminPromoCodes } from './use-admin-promo-codes';

export function AdminPromoCodesSection({ accessToken }: { accessToken: string }) {
  const state = useAdminPromoCodes(accessToken);
  return <section className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="rounded-xl border border-border bg-background p-2 text-muted-foreground"><Gift className="h-5 w-5" /></div>
      <div><h2 className="text-lg font-medium tracking-tight text-foreground">Промокоды</h2>
        <p className="mt-1 text-sm text-muted-foreground">Общие и индивидуальные коды по email, сроки действия и управление скидками.</p></div>
    </div>
    <AdminPromoForm state={state} /><AdminPromoTable state={state} />
  </section>;
}
