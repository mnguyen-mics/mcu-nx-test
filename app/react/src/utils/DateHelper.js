import moment from 'moment';

function formatCalendarDate(date) {
  return moment(date).locale('fr').format('L');
}

function isPastDate(date) {
  const now = moment();

  return date && date.isBefore(now, 'day');
}

function isToday(date) {
  const now = moment();

  return date && date.isSame(now, 'day');
}

/**
 * @param date1 Javascript date
 * @param date2 Javascript date
 */
function areDatesSameDay(date1, date2) {
  return (date1.setHours(0) - date2.setHours(0) === 0);
}

function truncateUpToHour(date, hourOfDay) {
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
  truncateUpToHour
};
