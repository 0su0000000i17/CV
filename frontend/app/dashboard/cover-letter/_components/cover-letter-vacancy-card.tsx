'use client';

import { useEffect, useRef, useState } from 'react';
import { Briefcase, ChevronDown } from 'lucide-react';

import type { PageExtractionStatus } from '@/src/shared/api/vacancies';

type Props = {
  vacancyInput: string;
  extractionStatus: PageExtractionStatus | null;
  extractionMessage: string;
  isCollapsed?: boolean;
  onVacancyInputChange: (value: string) => void;
};

function getVacancyPreview(value: string) {
  const normalizedValue = value.trim().replace(/\s+/g, ' ');

  if (!normalizedValue) {
    return 'Вакансия не добавлена';
  }

  if (normalizedValue.length <= 120) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, 120)}...`;
}

export function CoverLetterVacancyCard({
  vacancyInput,
  extractionStatus,
  extractionMessage,
  isCollapsed = false,
  onVacancyInputChange,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(!isCollapsed);
  const shouldShowCompactState = isCollapsed && !isExpanded;

  useEffect(() => {
    setIsExpanded(!isCollapsed);
  }, [isCollapsed, vacancyInput]);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea || shouldShowCompactState) {
      return;
    }

    const minHeight = 44;
    const maxHeight = 220;

    textarea.style.height = 'auto';

    const nextHeight = Math.min(
      Math.max(textarea.scrollHeight, minHeight),
      maxHeight
    );

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [vacancyInput, shouldShowCompactState]);

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20">
          <Briefcase className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-medium text-foreground">Вакансия</h2>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Вставьте ссылку или описание вакансии
          </p>
        </div>
      </div>

      {shouldShowCompactState ? (
        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0 truncate text-sm text-muted-foreground">
              {getVacancyPreview(vacancyInput)}
            </p>

            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Изменить
            </button>
          </div>
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          rows={1}
          value={vacancyInput}
          onChange={(event) => onVacancyInputChange(event.target.value)}
          placeholder="Ссылка на вакансию или полный текст описания"
          className="min-h-[44px] w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
        />
      )}

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
