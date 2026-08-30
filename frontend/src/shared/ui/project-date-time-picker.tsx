'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { Popover } from 'radix-ui';
import { DateTimeCalendar } from './date-time-calendar';
import { DateTimeSelector } from './date-time-selector';
import { formatDateTime, getInitialMonth, toDateKey } from './date-time-picker-utils';
import styles from './project-date-time-picker.module.css';

export function ProjectDateTimePicker(props: {
  value: string; onValueChange: (value: string) => void;
  ariaLabel: string; disabled?: boolean;
}) {
  const selectedDate = props.value.slice(0, 10);
  const selectedTime = props.value.slice(11, 16) || '09:00';
  const [open, setOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [timeMounted, setTimeMounted] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => getInitialMonth(props.value));
  useEffect(() => {
    if (timeOpen || !timeMounted) return;
    const timeout = window.setTimeout(() => setTimeMounted(false), 180);
    return () => window.clearTimeout(timeout);
  }, [timeMounted, timeOpen]);
  function setPopoverOpen(next: boolean) {
    if (next && props.value) setVisibleMonth(getInitialMonth(props.value));
    if (!next) setTimeOpen(false);
    setOpen(next);
  }
  function toggleTime() {
    if (timeOpen) setTimeOpen(false);
    else { setTimeMounted(true); setTimeOpen(true); }
  }
  return (
    <Popover.Root open={open} onOpenChange={setPopoverOpen}>
      <Popover.Trigger asChild><button type="button" aria-label={props.ariaLabel}
        disabled={props.disabled} className={styles.trigger}>
        <CalendarDays className={styles.triggerIcon} />
        <span className={props.value ? styles.triggerValue : styles.placeholder}>
          {props.value ? formatDateTime(props.value) : 'Выберите дату и время'}</span>
        <ChevronRight className={`${styles.triggerChevron} ${open ? styles.triggerChevronOpen : ''}`} />
      </button></Popover.Trigger>
      <Popover.Portal><Popover.Content align="start" side="bottom" sideOffset={7}
        collisionPadding={{ top: 78, right: 12, bottom: 12, left: 12 }} className={styles.popover}>
        <DateTimeCalendar visibleMonth={visibleMonth} selectedDate={selectedDate}
          onChangeMonth={(offset) => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1))}
          onChoose={(date) => props.onValueChange(`${toDateKey(date)}T${selectedTime}`)} />
        <DateTimeSelector selectedDate={selectedDate} selectedTime={selectedTime}
          open={timeOpen} mounted={timeMounted} onToggle={toggleTime}
          onChoose={(hour, minute) => { if (selectedDate) props.onValueChange(`${selectedDate}T${hour}:${minute}`); }}
          onClose={() => setTimeOpen(false)} onAnimationEnd={() => { if (!timeOpen) setTimeMounted(false); }} />
        <div className={styles.footer}>
          <button type="button" onClick={() => props.onValueChange('')} disabled={!props.value} className={styles.clearButton}>Очистить</button>
          <Popover.Close asChild><button type="button" className={styles.doneButton}>Готово</button></Popover.Close>
        </div>
      </Popover.Content></Popover.Portal>
    </Popover.Root>
  );
}
