'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  MARKETING_SECTIONS,
  type MarketingSection,
  requestMarketingScroll,
  savePendingMarketingScroll,
} from '@/src/shared/lib/marketing-navigation';

type Props = {
  isDashboard: boolean;
  showDashboard: boolean;
  onNavigate?: () => void;
  variant?: 'desktop' | 'mobile';
};

const desktopLinkClass =
  'inline-flex cursor-pointer items-center justify-center rounded-lg px-4 py-2 text-foreground/70 transition-[color,background-color,transform] duration-150 ease-out hover:bg-white/[0.055] hover:text-foreground active:scale-[0.98]';

const mobileLinkClass =
  'flex w-full cursor-pointer items-center rounded-xl border border-transparent px-4 py-3.5 text-left text-[0.95rem] text-foreground/78 transition-[color,background-color,border-color,transform] duration-150 ease-out hover:border-white/10 hover:bg-white/[0.045] hover:text-foreground active:scale-[0.99]';

const dashboardSlotClass = 'min-w-[9rem]';

export function HeaderNavLinks({
  isDashboard,
  showDashboard,
  onNavigate,
  variant = 'desktop',
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const sectionLinkClass =
    variant === 'mobile' ? mobileLinkClass : desktopLinkClass;

  if (isDashboard) {
    return null;
  }

  function handleSectionClick(section: MarketingSection) {
    onNavigate?.();

    if (pathname === '/') {
      requestMarketingScroll(section);
      return;
    }

    savePendingMarketingScroll(section);
    router.push('/');
  }

  return (
    <>
      <button
        type="button"
        onClick={() => handleSectionClick(MARKETING_SECTIONS.about)}
        className={sectionLinkClass}
      >
        О проекте
      </button>

      <button
        type="button"
        onClick={() => handleSectionClick(MARKETING_SECTIONS.process)}
        className={sectionLinkClass}
      >
        Как это работает
      </button>

      {showDashboard ? (
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={`${sectionLinkClass} ${
            variant === 'desktop' ? dashboardSlotClass : ''
          }`}
        >
          Личный кабинет
        </Link>
      ) : null}
    </>
  );
}
