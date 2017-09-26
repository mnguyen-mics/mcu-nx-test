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


export {
  formatCalendarDate,
  isPastDate,
  isToday,
};
