import moment, {Moment} from 'moment';

function formatCalendarDate(date: Date) {
  return moment(date).locale('fr').format('L');
}

function isPastDate(date: Moment) {
  const now = moment();

  return date && date.isBefore(now, 'day');
}

function isToday(date: Moment) {
  const now = moment();

  return date && date.isSame(now, 'day');
}

/**
 * @param date1 Javascript date
 * @param date2 Javascript date
 */
function areDatesSameDay(date1: Moment, date2: Moment) {
  const format = 'YYYY-MM-DD';
  return (date1.format(format) === date2.format(format));
}

function truncateUpToHour(date: Date, hourOfDay: number) {
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

export {
  formatCalendarDate,
  isPastDate,
  isToday,
  areDatesSameDay,
  truncateUpToHour,
};
