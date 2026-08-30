import { CheckCircle2 } from 'lucide-react';
import type { PointerEventHandler } from 'react';

import { PROCESS_RESULTS } from './home-process-data';
import styles from '../page.module.css';

type Props = { onSurfacePointerMove: PointerEventHandler<HTMLElement> };

export function HomeProcessResults({ onSurfacePointerMove }: Props) {
  return (
    <div data-reveal onPointerMove={onSurfacePointerMove} className={`${styles.interactiveSurface} ${styles.revealItem} mt-4 grid gap-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.025] p-7 sm:p-9 lg:grid-cols-[0.75fr_1.25fr] lg:items-center`}>
      <div className="relative z-10">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-foreground/55">Что вы получите</p>
        <h3 className="mt-4 text-3xl font-normal leading-tight tracking-[-0.04em] text-foreground">Понятный результат на каждом этапе</h3>
      </div>
      <div className="relative z-10 grid gap-3 sm:grid-cols-2">
        {PROCESS_RESULTS.map((result) => (
          <div key={result} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white/65" />
            <p className="text-sm leading-6 text-foreground/85">{result}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
