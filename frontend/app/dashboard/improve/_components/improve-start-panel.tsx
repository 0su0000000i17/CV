import { Sparkles, Wand2 } from 'lucide-react';

import { improvementFeatures } from '../_lib/improvement-features';
import styles from '../improve.module.css';

export function ImproveStartPanel({ disabled, onStart }: {
  disabled: boolean;
  onStart: () => void;
}) {
  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.018] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/65">
          <Sparkles className="h-4 w-4" strokeWidth={1.7} />
        </div>
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-white/30">Результат</p>
          <h2 className="mt-1 text-lg font-medium tracking-[-0.02em] text-white">Что изменится</h2>
        </div>
      </div>
      <div className="mt-5 space-y-1">
        {improvementFeatures.map(({ title, description, icon: Icon }) => (
          <div key={title} className={`${styles.feature} flex gap-3 rounded-xl px-2 py-3`}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-white/45" strokeWidth={1.7} />
            <div>
              <p className="text-sm font-medium text-white/85">{title}</p>
              <p className="mt-1 text-xs leading-5 text-white/35">{description}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onStart}
        className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2563a9] px-4 py-3 text-sm font-medium text-white transition-[background-color,transform,box-shadow] hover:bg-[#2b6fba] hover:shadow-[0_10px_32px_rgba(24,88,155,0.22)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <Wand2 className="h-4 w-4" />
        Улучшить резюме
      </button>
    </aside>
  );
}
