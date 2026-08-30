'use client';

import { GitCompareArrows } from 'lucide-react';

import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';
import type { UploadedResume } from '@/src/shared/api/resumes';

import { ChangeExplanationItem } from './change-explanation-item';
import { buildChangeExplanations } from './change-explanations';

type Props = { result: ResumeAdaptationResult; sourceResume?: UploadedResume; vacancyText?: string };

export function ChangeExplanationsPanel({ result, sourceResume, vacancyText }: Props) {
  const explanations = buildChangeExplanations({ result, sourceResume, vacancyText });
  if (!explanations.length) return null;
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.018] p-5 sm:p-6">
      <div className="flex items-start gap-3.5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-white/65">
          <GitCompareArrows className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-white/30">
            Прозрачные изменения
          </p>
          <h2 className="mt-1 text-lg font-medium tracking-[-0.02em] text-white">
            Что изменили и почему
          </h2>
          <p className="mt-1 text-sm leading-6 text-white/40">
            Сравниваем результат с исходной версией. В каждом блоке видно основание изменения и какие факты сохранены.
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-2">
        {explanations.map((item, index) => (
          <ChangeExplanationItem key={item.id} item={item} initiallyOpen={index === 0} />
        ))}
      </div>
    </section>
  );
}
