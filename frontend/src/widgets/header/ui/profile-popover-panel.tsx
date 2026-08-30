import Link from 'next/link';
import { forwardRef } from 'react';
import { ChevronRight, CircleUserRound, CreditCard, LogOut, Settings } from 'lucide-react';
import { RollingNumber } from '@/src/shared/ui/rolling-number';
import styles from './profile-popover.module.css';

export const ProfilePopoverPanel = forwardRef<HTMLDivElement, {
  top: number; right: number; open: boolean; loading: boolean;
  fullName: string; email: string; planName: string;
  balance?: number; balanceLoading: boolean;
  onClose: () => void; onSignOut: () => void;
}>(function ProfilePopoverPanel(props, ref) {
  return (
    <div ref={ref} id="profile-popover-menu" role="dialog"
      aria-label="Профиль пользователя" style={{ top: props.top, right: props.right }}
      className={`${styles.panel} ${props.open ? styles.panelOpen : styles.panelClosing} fixed z-[100] w-[min(19rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-foreground/15 p-4 text-foreground shadow-[0_20px_64px_rgba(0,0,0,0.28)] backdrop-blur-[18px] backdrop-saturate-[1.5]`}>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-foreground/15 text-brand-400" aria-hidden="true">
          <CircleUserRound className="h-5 w-5" strokeWidth={1.65} />
        </span>
        <div className="min-w-0 flex-1">{props.loading ? <div className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-white/8" />
          <div className="h-3 w-36 animate-pulse rounded bg-white/8" /></div> : <>
          <p className="truncate text-sm font-semibold tracking-[-0.015em] text-foreground">{props.fullName}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{props.email}</p></>}</div>
      </div>
      <div className="mt-4 grid grid-cols-2 divide-x divide-foreground/10 rounded-lg border border-foreground/12">
        <div className="flex min-h-14 flex-col justify-center px-3 py-2.5">
          <span className="text-[0.68rem] text-muted-foreground">Тариф</span>
          <strong className="mt-1 truncate text-xs font-semibold uppercase tracking-[0.04em] text-brand-400">{props.planName}</strong>
        </div>
        <div className="flex min-h-14 flex-col justify-center px-3 py-2.5">
          <span className="text-[0.68rem] text-muted-foreground">Кредиты</span>
          <strong className="mt-1 text-sm font-semibold text-foreground">{props.balanceLoading || props.balance === undefined ? '…' : <RollingNumber value={props.balance} />}</strong>
        </div>
      </div>
      <div className="mt-3 grid gap-1.5">
        <PopoverLink href="/dashboard/billing" label="Пополнить баланс" icon={<CreditCard className="h-4 w-4 text-brand-400" strokeWidth={1.7} />} onClick={props.onClose} />
        <PopoverLink href="/dashboard/settings" label="Настройки профиля" icon={<Settings className="h-4 w-4 text-brand-400" strokeWidth={1.7} />} onClick={props.onClose} />
        <button type="button" onClick={props.onSignOut}
          className="grid min-h-11 w-full grid-cols-[1rem_minmax(0,1fr)] items-center gap-3 rounded-lg border border-transparent px-3 text-left text-sm font-medium text-muted-foreground transition-[color,border-color,background-color,transform] hover:border-foreground/12 hover:bg-foreground/[0.045] hover:text-foreground active:scale-[0.985]">
          <LogOut className="h-4 w-4" strokeWidth={1.7} /><span>Выйти</span>
        </button>
      </div>
    </div>
  );
});

function PopoverLink(props: { href: string; label: string; icon: React.ReactNode; onClick: () => void }) {
  return <Link href={props.href} onClick={props.onClick}
    className="group grid min-h-11 grid-cols-[1rem_minmax(0,1fr)_1rem] items-center gap-3 rounded-lg border border-transparent px-3 text-sm font-medium text-foreground/75 transition-[color,border-color,background-color,transform] hover:border-foreground/12 hover:bg-foreground/[0.045] hover:text-foreground active:scale-[0.985]">
    {props.icon}<span>{props.label}</span><ChevronRight className="h-4 w-4 text-foreground/30 transition-transform group-hover:translate-x-0.5" />
  </Link>;
}
