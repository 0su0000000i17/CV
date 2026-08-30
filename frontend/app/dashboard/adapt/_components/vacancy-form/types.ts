import type { ClipboardEvent, RefObject } from 'react';

import type { VacancyInputKind } from '../../_lib/adapt-page-utils';
import type { PageExtractionStatus } from '@/src/shared/api/vacancies';

export type VacancyFormProps = {
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

export type VacancyInputFieldProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  vacancyInput: string;
  isTextMode: boolean;
  isUrlMode: boolean;
  onVacancyInputChange: (value: string) => void;
  onInputPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
};
