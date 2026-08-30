import { ArrowRight, BriefcaseBusiness } from 'lucide-react';
import Link from 'next/link';
import type { PointerEventHandler } from 'react';

import styles from '../page.module.css';

type Props = { onSurfacePointerMove: PointerEventHandler<HTMLElement> };

const TOOLS = [
  {
    href: '/dashboard/applications', icon: BriefcaseBusiness,
    title: 'Результаты откликов по версиям',
    description: 'Отмечайте ответы, интервью и офферы — сервис покажет, какая версия работает лучше.',
  },
] as const;

export function HomeProcessTools({ onSurfacePointerMove }: Props) {
  return (
    <div className="mt-4 grid gap-4">
      {TOOLS.map((tool) => {
        const Icon = tool.icon;
        return (
          <Link
            key={tool.href}
            href={tool.href}
            data-reveal
            onPointerMove={onSurfacePointerMove}
            className={`${styles.interactiveSurface} ${styles.revealItem} group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-6 sm:p-7`}
          >
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/65">
                <Icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-white/30 transition-transform group-hover:translate-x-1" />
            </div>
            <h3 className="relative z-10 mt-10 text-xl font-medium text-white">{tool.title}</h3>
            <p className="relative z-10 mt-3 text-sm leading-6 text-white/40">{tool.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
