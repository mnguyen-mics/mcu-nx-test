import moment from 'moment';

function isPastDate(current) {
  const now = moment();
  return current && current.isBefore(now);
}

export {
  isPastDate,
};
