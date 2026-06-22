'use client';

import { useEffect, useRef } from 'react';
import { Briefcase, LinkIcon, Loader2 } from 'lucide-react';

import type { PageExtractionStatus } from '@/src/shared/api/vacancies';

type VacancyInputKind = 'empty' | 'url' | 'text';

type VacancyFormProps = {
  vacancyInput: string;
  vacancyInputKind: VacancyInputKind;
  preparedVacancyTextLength: number;
  isPreparing: boolean;
  extractionStatus: PageExtractionStatus | null;
  extractionMessage: string;
  onVacancyInputChange: (value: string) => void;
  onPrepareVacancy: () => void;
};

export function VacancyForm({
  vacancyInput,
  vacancyInputKind,
  preparedVacancyTextLength,
  isPreparing,
  extractionStatus,
  extractionMessage,
  onVacancyInputChange,
  onPrepareVacancy,
}: VacancyFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isSuccessMessage = extractionStatus === 'success';
  const isUrlMode = vacancyInputKind === 'url';
  const isTextMode = vacancyInputKind === 'text';

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const minHeight = isTextMode ? 72 : 22;
    const maxHeight = 180;

    textarea.style.height = 'auto';

    const nextHeight = Math.min(
      Math.max(textarea.scrollHeight, minHeight),
      maxHeight
    );

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [isTextMode, vacancyInput]);

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="mb-6 flex items-start gap-4">
        <div className="rounded-xl bg-muted p-3">
          <Briefcase className="h-5 w-5 text-foreground" />
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">Вакансия</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Вставьте ссылку на вакансию или сразу полный текст описания.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <label className="mb-2 block text-sm text-muted-foreground">
            Ссылка или текст вакансии
          </label>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-2.5">
            <LinkIcon className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />

            <textarea
              ref={textareaRef}
              value={vacancyInput}
              rows={1}
              onChange={(event) => onVacancyInputChange(event.target.value)}
              placeholder="https://hh.ru/vacancy/... или полный текст вакансии"
              className="max-h-[180px] min-h-[22px] w-full resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {isUrlMode
              ? 'Мы сами получим описание вакансии по ссылке.'
              : 'Если вставить полный текст, мы очистим его и используем для адаптации.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onPrepareVacancy}
          disabled={isPreparing || !vacancyInput.trim()}
          className="inline-flex h-[42px] items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-60 md:mt-[30px]"
        >
          {isPreparing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Адаптируем...
            </>
          ) : (
            'Адаптировать резюме'
          )}
        </button>
      </div>

      {extractionMessage ? (
        <div
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            isSuccessMessage
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
              : 'border-border bg-background text-muted-foreground'
          }`}
        >
          <p>{extractionMessage}</p>

          {isSuccessMessage && preparedVacancyTextLength > 0 ? (
            <p className="mt-1 text-xs opacity-80">
              Подготовлено символов: {preparedVacancyTextLength}
            </p>
          ) : null}
        </div>
      ) : null}

      {isTextMode ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Текст можно править прямо в этом поле. Когда подключим адаптацию, этот
          текст пойдёт в анализ вместе с выбранным резюме.
        </p>
      ) : null}
    </div>
  );
}