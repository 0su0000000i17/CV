'use client';

import { useEffect, useRef } from 'react';
import { Briefcase, LinkIcon, Loader2, SearchCheck } from 'lucide-react';

import type { PageExtractionStatus } from '@/src/shared/api/vacancies';

type VacancyInputKind = 'empty' | 'url' | 'text';

type VacancyFormProps = {
  vacancyInput: string;
  vacancyInputKind: VacancyInputKind;
  preparedVacancyTextLength: number;
  isPreparing: boolean;
  isCheckingFit: boolean;
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
  isCheckingFit,
  extractionStatus,
  extractionMessage,
  onVacancyInputChange,
  onPrepareVacancy,
}: VacancyFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isSuccessMessage = extractionStatus === 'success';
  const isUrlMode = vacancyInputKind === 'url';
  const isTextMode = vacancyInputKind === 'text';
  const isBusy = isPreparing || isCheckingFit;

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea || !isTextMode) {
      return;
    }

    const minHeight = 64;
    const maxHeight = 180;

    textarea.style.height = 'auto';

    const nextHeight = Math.min(
      Math.max(textarea.scrollHeight, minHeight),
      maxHeight
    );

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [vacancyInput, isTextMode]);

  function handleInputPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const pastedText = event.clipboardData.getData('text');

    if (!pastedText) {
      return;
    }

    const looksLikeLongText =
      pastedText.includes('\n') ||
      pastedText.length > 180 ||
      pastedText.split(/\s+/).length > 20;

    if (!looksLikeLongText) {
      return;
    }

    event.preventDefault();
    onVacancyInputChange(pastedText);
  }

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-xl bg-muted p-2.5">
          <Briefcase className="h-5 w-5 text-foreground" />
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">Вакансия</h2>

          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Вставьте ссылку или полный текст. Сначала проверим, можно ли
            адаптировать выбранное резюме под эту роль.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px] md:items-start">
        <div>
          <label className="mb-2 block text-sm text-muted-foreground">
            Ссылка или текст вакансии
          </label>

          <div className="flex min-h-[44px] items-center gap-3 rounded-xl border border-border bg-background px-3">
            <LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />

            {isTextMode ? (
              <textarea
                ref={textareaRef}
                value={vacancyInput}
                rows={1}
                onChange={(event) => onVacancyInputChange(event.target.value)}
                placeholder="Вставьте полный текст вакансии"
                className="max-h-[180px] min-h-[64px] w-full resize-none bg-transparent py-2.5 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
              />
            ) : (
              <input
                value={vacancyInput}
                onChange={(event) => onVacancyInputChange(event.target.value)}
                onPaste={handleInputPaste}
                placeholder="Ссылка или текст вакансии"
                title={vacancyInput}
                className="h-11 w-full truncate bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            )}
          </div>

          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {isUrlMode
              ? 'Ссылку используем только для получения описания вакансии.'
              : 'Если вставить полный текст, используем его напрямую для проверки.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onPrepareVacancy}
          disabled={isBusy || !vacancyInput.trim()}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-60 md:mt-[30px]"
        >
          {isPreparing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Разбираем...
            </>
          ) : isCheckingFit ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Проверяем...
            </>
          ) : (
            <>
              <SearchCheck className="h-4 w-4" />
              Проверить совместимость
            </>
          )}
        </button>
      </div>

      {extractionMessage ? (
        <div
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            isSuccessMessage
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
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
    </div>
  );
}