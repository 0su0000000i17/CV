'use client';

import { CheckCheck, ChevronDown, ShieldCheck } from 'lucide-react';
import { useId, useState } from 'react';

import type { ChangeExplanation } from './change-explanation-types';

export function ChangeExplanationItem({ item, initiallyOpen }: {
  item: ChangeExplanation;
  initiallyOpen: boolean;
}) {
  const contentId = useId();
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-controls={contentId}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-3.5 text-left"
      >
        <span className="text-sm font-medium text-white/85">{item.section}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-white/30 transition-transform duration-300 motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        id={contentId}
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className={`border-t border-white/8 p-4 transition-opacity duration-300 motion-reduce:transition-none ${isOpen ? 'opacity-100 delay-100' : 'opacity-0'}`}>
            <div className="grid gap-3 lg:grid-cols-2">
              <TextVersion label="Было" value={item.before} muted />
              <TextVersion label="Стало" value={item.after} />
            </div>
            <div className="mt-3 rounded-lg border border-brand-500/20 bg-brand-500/8 p-3">
              <div className="flex gap-2.5">
                <CheckCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-brand-300">Почему</p>
                  <p className="mt-1 text-sm leading-6 text-white/60">{item.reason}</p>
                </div>
              </div>
            </div>
            {item.evidence.length ? (
              <div className="mt-3 flex gap-2.5 px-1">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-white/35" />
                <p className="text-xs leading-5 text-white/35">Основание: {item.evidence.join(' · ')}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function TextVersion({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-lg border border-white/8 bg-black/15 p-3">
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/25">{label}</p>
      <p className={`mt-2 whitespace-pre-wrap text-sm leading-6 ${muted ? 'text-white/38' : 'text-white/72'}`}>
        {value}
      </p>
    </div>
  );
}
