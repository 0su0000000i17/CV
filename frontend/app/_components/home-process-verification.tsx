import { ArrowRight } from 'lucide-react';

import { VERIFICATION_STEPS } from './home-process-verification-data';

export function HomeProcessVerification() {
  return (
    <div className="mt-10 overflow-hidden rounded-xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div className="grid gap-3 md:grid-cols-5">
        {VERIFICATION_STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="relative rounded-lg border border-white/8 bg-black/15 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-white/65">
                  <Icon className="h-4 w-4" strokeWidth={1.7} />
                </div>
                <span className="text-[0.65rem] font-medium tabular-nums text-white/25">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-sm font-medium leading-5 text-white/85">{step.title}</h3>
              <p className="mt-2 text-xs leading-5 text-white/35">{step.description}</p>
              {index < VERIFICATION_STEPS.length - 1 ? (
                <ArrowRight className="absolute -right-2.5 top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 text-white/20 md:block" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
