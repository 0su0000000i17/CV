import { LinkIcon } from 'lucide-react';

import type { VacancyInputFieldProps } from './types';

export function VacancyInputField({
  textareaRef,
  vacancyInput,
  isTextMode,
  isUrlMode,
  onVacancyInputChange,
  onInputPaste,
}: VacancyInputFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm text-muted-foreground">
        Ссылка или текст вакансии
      </label>

      <div className="flex min-h-[44px] items-start gap-3 rounded-xl border border-border bg-background px-3">
        <LinkIcon className="mt-3.5 h-4 w-4 shrink-0 text-muted-foreground" />

        {isTextMode ? (
          <textarea
            ref={textareaRef}
            value={vacancyInput}
            rows={1}
            onChange={(event) => onVacancyInputChange(event.target.value)}
            placeholder="Вставьте полный текст вакансии"
            className="max-h-[220px] min-h-[44px] w-full resize-none bg-transparent py-2.5 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
          />
        ) : (
          <input
            value={vacancyInput}
            onChange={(event) => onVacancyInputChange(event.target.value)}
            onPaste={onInputPaste}
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
  );
}
