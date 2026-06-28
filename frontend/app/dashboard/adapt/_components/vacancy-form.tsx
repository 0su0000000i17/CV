'use client';

import { useEffect, useRef, type ClipboardEvent } from 'react';
import { Briefcase } from 'lucide-react';

import type { VacancyFormProps } from './vacancy-form/types';
import { VacancyInputField } from './vacancy-form/vacancy-input-field';
import { VacancyStatusMessage } from './vacancy-form/vacancy-status-message';
import { VacancySubmitButton } from './vacancy-form/vacancy-submit-button';

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

  function handleInputPaste(event: ClipboardEvent<HTMLInputElement>) {
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
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20">
          <Briefcase className="h-5 w-5" />
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
        <VacancyInputField
          textareaRef={textareaRef}
          vacancyInput={vacancyInput}
          isTextMode={isTextMode}
          isUrlMode={isUrlMode}
          onVacancyInputChange={onVacancyInputChange}
          onInputPaste={handleInputPaste}
        />

        <VacancySubmitButton
          vacancyInput={vacancyInput}
          isPreparing={isPreparing}
          isCheckingFit={isCheckingFit}
          onPrepareVacancy={onPrepareVacancy}
        />
      </div>

      <VacancyStatusMessage
        isSuccessMessage={isSuccessMessage}
        extractionMessage={extractionMessage}
        preparedVacancyTextLength={preparedVacancyTextLength}
      />
    </div>
  );
}
