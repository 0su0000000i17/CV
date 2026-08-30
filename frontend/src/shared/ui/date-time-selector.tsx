'use client';

import { forwardRef, useEffect, useRef } from 'react';
import { ChevronRight, Clock3 } from 'lucide-react';
import { hours, minutes } from './date-time-picker-utils';
import styles from './project-date-time-picker.module.css';

export function DateTimeSelector(props: {
  selectedDate: string; selectedTime: string; open: boolean; mounted: boolean;
  onToggle: () => void; onChoose: (hour: string, minute: string) => void;
  onClose: () => void; onAnimationEnd: () => void;
}) {
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const [selectedHour, selectedMinute] = props.selectedTime.split(':');
  useEffect(() => {
    if (!props.open) return;
    const frame = window.requestAnimationFrame(() => {
      hourRef.current?.querySelector<HTMLElement>('[data-selected="true"]')?.scrollIntoView({ block: 'center' });
      minuteRef.current?.querySelector<HTMLElement>('[data-selected="true"]')?.scrollIntoView({ block: 'center' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [props.open]);
  return (
    <div className={styles.timeRow}>
      <span className={styles.timeLabel}><Clock3 />Время</span>
      <div className={styles.timePickerShell}>
        <button type="button" aria-label="Выбрать время интервью" aria-expanded={props.open}
          aria-haspopup="dialog" onClick={props.onToggle} disabled={!props.selectedDate}
          className={styles.timeTrigger}><span>{props.selectedDate ? props.selectedTime : '--:--'}</span>
          <ChevronRight className={props.open ? styles.timeChevronOpen : styles.timeChevron} /></button>
        {props.mounted ? <div className={styles.timeMenu} role="dialog" aria-label="Выбор времени интервью"
          aria-hidden={!props.open} data-state={props.open ? 'open' : 'closed'} onAnimationEnd={props.onAnimationEnd}>
          <div className={styles.timeMenuHeader} aria-hidden="true"><span>Часы</span><span>Минуты</span></div>
          <div className={styles.timeColumns}>
            <TimeOptions ref={hourRef} label="Часы" values={hours} selected={selectedHour}
              disabled={!props.open} onChoose={(hour) => props.onChoose(hour, selectedMinute)} />
            <TimeOptions ref={minuteRef} label="Минуты" values={minutes} selected={selectedMinute}
              disabled={!props.open} onChoose={(minute) => { props.onChoose(selectedHour, minute); props.onClose(); }} />
          </div>
        </div> : null}
      </div>
    </div>
  );
}

const TimeOptions = forwardRef<HTMLDivElement, { label: string; values: string[];
  selected: string; disabled: boolean; onChoose: (value: string) => void }>(function TimeOptions(
  { label, values, selected, disabled, onChoose }, ref
) {
  return <div ref={ref} className={styles.timeList} role="listbox" aria-label={label}>
    {values.map((value) => <button key={value} type="button" role="option"
      aria-selected={value === selected} data-selected={value === selected}
      disabled={disabled} onClick={() => onChoose(value)} className={styles.timeOption}>{value}</button>)}
  </div>;
});
