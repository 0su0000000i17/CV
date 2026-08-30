import type { PointerEventHandler } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

import type { HomePlan } from './home-plans';
import styles from '../page.module.css';

export function HomePlanCard({
  plan,
  billingHref,
  onPointerMove,
}: {
  plan: HomePlan;
  billingHref: string;
  onPointerMove: PointerEventHandler<HTMLElement>;
}) {
  return (
    <article
      data-reveal
      onPointerMove={onPointerMove}
      className={`${styles.interactiveSurface} ${styles.revealItem} relative flex min-h-[27rem] flex-col overflow-hidden rounded-[1.75rem] border p-5 sm:p-6 ${
        plan.highlighted
          ? 'border-white/25 bg-white/[0.05] shadow-[0_18px_70px_rgba(0,0,0,0.18)]'
          : 'border-border bg-card/55'
      }`}
    >
      <div className="relative z-10 flex min-h-7 items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{plan.name}</p>
        {plan.badge ? (
          <span className="rounded-full border border-white/12 bg-white/[0.035] px-2.5 py-1 text-[0.65rem] font-medium text-white/60">
            {plan.badge}
          </span>
        ) : null}
      </div>
      <p className="relative z-10 mt-4 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">
        {plan.description}
      </p>
      <div className="relative z-10 mt-5 border-y border-white/[0.08] py-4">
        <p className="text-3xl font-semibold tracking-[-0.045em] text-foreground">
          {plan.price}
        </p>
        <p className="mt-1 text-xs font-medium text-white/45">
          {plan.credits} · разовый пакет
        </p>
      </div>
      <ul className="relative z-10 mt-5 space-y-3">
        {plan.details.map((detail) => (
          <li key={detail} className="flex items-start gap-2.5 text-xs leading-5 text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/45" />
            {detail}
          </li>
        ))}
      </ul>
      <Link
        href={billingHref}
        className={`relative z-10 mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-[background-color,border-color,box-shadow,transform] active:scale-[0.98] ${
          plan.highlighted
            ? 'bg-brand-500 text-white hover:bg-brand-600'
            : 'border border-white/12 text-foreground hover:border-white/25 hover:bg-white/[0.035]'
        }`}
      >
        {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}
