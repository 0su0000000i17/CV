import { Clock3 } from 'lucide-react';

import { ProjectDateTimePicker } from '@/src/shared/ui/project-date-time-picker';
import {
  formatRublesInput,
  isOfferSalaryValid,
  sanitizeRublesInput,
  type ApplicationFormState,
} from '../_lib/application-form';
import styles from '../applications.module.css';
import { ApplicationField, applicationInputClassName } from './application-field';

type ChangeField = <K extends keyof ApplicationFormState>(
  field: K,
  value: ApplicationFormState[K]
) => void;

export function ApplicationScheduleFields({
  form,
  onChange,
}: {
  form: ApplicationFormState;
  onChange: ChangeField;
}) {
  const showInterview = form.status === 'interview' || Boolean(form.interviewAt);
  const showOffer = form.status === 'offer';
  const offerValid = isOfferSalaryValid(form.offerSalaryRub);

  return (
    <>
      <div
        data-visible={showInterview}
        aria-hidden={!showInterview}
        className={`${styles.scheduleShell} md:col-span-2`}
      >
        <div className={styles.scheduleInner}>
          <ApplicationField label="Дата и время интервью">
            <ProjectDateTimePicker
              value={form.interviewAt}
              onValueChange={(value) => onChange('interviewAt', value)}
              ariaLabel="Дата и время интервью"
              disabled={!showInterview}
            />
          </ApplicationField>
          <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-foreground/45">
            <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Время сохраняется в вашем часовом поясе и будет показано в планировщике.
          </p>
        </div>
      </div>

      <div
        data-visible={showOffer}
        aria-hidden={!showOffer}
        className={`${styles.scheduleShell} md:col-span-2`}
      >
        <div className={styles.scheduleInner}>
          <ApplicationField label="Сумма оффера">
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={formatRublesInput(form.offerSalaryRub)}
                onChange={(event) =>
                  onChange('offerSalaryRub', sanitizeRublesInput(event.target.value))
                }
                disabled={!showOffer}
                aria-invalid={showOffer && !offerValid}
                placeholder="50 000"
                className={`${applicationInputClassName} pr-10 tabular-nums`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-sm text-foreground/40">
                ₽
              </span>
            </div>
          </ApplicationField>
          <p
            data-visible={!offerValid}
            aria-hidden={offerValid}
            className={styles.offerValidation}
          >
            <span>Введите целую сумму от 1 ₽ до 1 000 000 000 ₽.</span>
          </p>
        </div>
      </div>
    </>
  );
}
