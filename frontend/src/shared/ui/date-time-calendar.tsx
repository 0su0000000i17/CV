import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildCalendarDays, toDateKey, weekDays } from './date-time-picker-utils';
import styles from './project-date-time-picker.module.css';

export function DateTimeCalendar(props: {
  visibleMonth: Date; selectedDate: string;
  onChangeMonth: (offset: number) => void; onChoose: (date: Date) => void;
}) {
  const days = buildCalendarDays(props.visibleMonth);
  return <>
    <div className={styles.calendarHeader}>
      <button type="button" onClick={() => props.onChangeMonth(-1)} aria-label="Предыдущий месяц" className={styles.navButton}><ChevronLeft /></button>
      <p className={styles.monthTitle}>{props.visibleMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</p>
      <button type="button" onClick={() => props.onChangeMonth(1)} aria-label="Следующий месяц" className={styles.navButton}><ChevronRight /></button>
    </div>
    <div className={styles.weekDays} aria-hidden="true">{weekDays.map((day) => <span key={day}>{day}</span>)}</div>
    <div className={styles.daysGrid} role="grid" aria-label="Календарь">
      {days.map((date) => {
        const key = toDateKey(date);
        return <button key={key} type="button" role="gridcell"
          aria-label={date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          aria-selected={key === props.selectedDate}
          data-outside={date.getMonth() !== props.visibleMonth.getMonth()}
          data-selected={key === props.selectedDate} onClick={() => props.onChoose(date)}
          className={styles.dayButton}>{date.getDate()}</button>;
      })}
    </div>
  </>;
}
