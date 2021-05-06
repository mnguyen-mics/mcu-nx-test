import moment, { Moment } from 'moment';

/**
 * @param date1 Javascript date
 * @param date2 Javascript date
 */
export function areDatesSameDay(date1: Moment, date2: Moment) {
  const format = 'YYYY-MM-DD';
  return date1.format(format) === date2.format(format);
}

export const DEFAULT_DATE_FORMAT = 'DD/MM/YYYY';

export function formatUnixTimestamp(ts: number | null | undefined, format?: string) {
  if (!ts) return '--/--/----';
  return moment(ts).format(format || DEFAULT_DATE_FORMAT);
}

export function truncateUpToHour(date: Date, hourOfDay: number) {
  if (hourOfDay) {
    date.setHours(hourOfDay);
    date.setMinutes(0);
    date.setSeconds(0);
  } else {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
  }
}

export function getAllDates(
  timeUnit: 'HOUR' | 'DAY',
  dateRange: { from: string; to: string },
): string[] {
  const format = timeUnit === 'HOUR' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';

  const allDates = [moment(dateRange.from).format(format)];

  const to = timeUnit === 'HOUR' ? moment(dateRange.to).add(23, 'hours') : moment(dateRange.to);

  while (allDates[allDates.length - 1] !== to.format(format)) {
    allDates.push(
      moment(allDates[allDates.length - 1])
        .add(1, timeUnit === 'HOUR' ? 'hours' : 'days')
        .format(format),
    );
  }

  return allDates;
}

export type WeekDay =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';
