'use client';

import { createPortal } from 'react-dom';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { CircleUserRound } from 'lucide-react';
import { supabase } from '@/src/shared/lib/supabase/client';
import { useAuth } from '@/src/shared/hooks/use-auth';
import { useTokenSummaryQuery } from '@/src/shared/hooks/use-token-summary-query';
import { ProfilePopoverPanel } from './profile-popover-panel';
import { useProfilePopover } from './use-profile-popover';
import styles from './profile-popover.module.css';

export function ProfilePopover(props: { fullName: string; email: string; loading: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const tokens = useTokenSummaryQuery(accessToken);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const popover = useProfilePopover({ containerRef, triggerRef, panelRef });
  async function signOut() {
    popover.close();
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) { console.error(error); return; }
    queryClient.clear(); router.replace('/'); router.refresh();
  }
  const panel = popover.isRendered && popover.position
    ? createPortal(<ProfilePopoverPanel ref={panelRef}
      top={popover.position.top} right={popover.position.right} open={popover.isOpen}
      loading={props.loading} fullName={props.fullName} email={props.email}
      planName={tokens.data?.currentPlan ?? 'Free'} balance={tokens.data?.balance}
      balanceLoading={tokens.isLoading} onClose={popover.close} onSignOut={signOut} />, document.body)
    : null;
  return (
    <div ref={containerRef} className="relative h-10 w-10">
      <button ref={triggerRef} type="button" onClick={popover.toggle}
        className={`${styles.trigger} flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-[background-color,color,transform] duration-150 hover:bg-white/8 hover:text-white active:scale-[0.96]`}
        aria-label="Открыть профиль" aria-expanded={popover.isOpen}
        aria-haspopup="dialog" aria-controls="profile-popover-menu">
        <CircleUserRound className="h-7 w-7" strokeWidth={1.7} />
      </button>{panel}
    </div>
  );
}
