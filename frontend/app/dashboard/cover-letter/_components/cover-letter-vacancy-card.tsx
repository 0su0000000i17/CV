'use client';

import { useRef, useState } from 'react';
import { Briefcase } from 'lucide-react';

import type { PageExtractionStatus } from '@/src/shared/api/vacancies';

import { CoverLetterVacancyInput } from './cover-letter-vacancy-input';
import { useAutoResizeTextarea } from './use-auto-resize-textarea';

type Props = {
  vacancyInput: string;
  extractionStatus: PageExtractionStatus | null;
  extractionMessage: string;
  isCollapsed?: boolean;
  onVacancyInputChange: (value: string) => void;
};

export function CoverLetterVacancyCard({
  vacancyInput,
  extractionStatus,
  extractionMessage,
  isCollapsed = false,
  onVacancyInputChange,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [expansionState, setExpansionState] = useState({
    isCollapsed,
    isExpanded: !isCollapsed,
  });
  const isExpanded =
    expansionState.isCollapsed === isCollapsed
      ? expansionState.isExpanded
      : !isCollapsed;
  const shouldShowCompactState = isCollapsed && !isExpanded;

  function setIsExpanded(nextValue: boolean) {
    setExpansionState({ isCollapsed, isExpanded: nextValue });
  }
  useAutoResizeTextarea(textareaRef, vacancyInput, shouldShowCompactState);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.018] p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/60">
          <Briefcase className="h-4 w-4" strokeWidth={1.7} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-medium text-foreground">Вакансия</h2>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Вставьте ссылку или описание вакансии
          </p>
        </div>
      </div>

      <CoverLetterVacancyInput
        compact={shouldShowCompactState}
        textareaRef={textareaRef}
        value={vacancyInput}
        onChange={onVacancyInputChange}
        onExpand={() => setIsExpanded(true)}
      />

      {extractionMessage ? (
        <p
          className={`mt-3 text-sm ${
            extractionStatus === 'success'
              ? 'text-emerald-500'
              : 'text-orange-500'
          }`}
        >
          {extractionMessage}
        </p>
      ) : null}
    </section>
  );
}
