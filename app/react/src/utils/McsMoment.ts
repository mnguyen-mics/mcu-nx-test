import moment from 'moment';

const DATE_FORMAT = 'YYYY-MM-DD';

type McsDate = Date | string | number;

export type McsRange = {
  from: McsMoment;
  to: McsMoment;
};

export function isNowFormat(date: McsDate) {
  return !!(typeof date === 'string' && (/^now-(\d+)d$/g.test(date) || date === 'now'));
}

export function isValidMcsDate(date: McsDate) {
  if (typeof date === 'string' && /^now-(\d+)d$/g.test(date)) {
    return true;
  } else if (typeof date === 'string' && /^now$/g.test(date)) {
    return true;
  } else if (moment(date).isValid()) {
    return true;
  }
  return false;
}

export function convertMcsDateToMoment(date: McsDate): moment.Moment {
  // test if date is in format now-Xd
  if (typeof date === 'string' && /^now-(\d+)d$/g.test(date)) {
    const days = date.replace('now-', '').replace('d', '');
    return moment().subtract(days, 'days');
  } else if (date === 'now') {
    return moment();
  } else {
    return moment(date);
  }
}

export function formatMcsDate(range: McsRange, inclusive?: boolean) {
  const from = range.from.toMoment().format(DATE_FORMAT);
  const to = inclusive
    ? range.to.toMoment().add(1, 'day').format(DATE_FORMAT)
    : range.to.toMoment().format(DATE_FORMAT);
  return {
    from: from,
    to: to,
  };
}

export default class McsMoment {
  value: McsDate;

  constructor(date: McsDate) {
    this.value = date;
  }

  toMoment() {
    return convertMcsDateToMoment(this.value);
  }

  raw() {
    return this.value;
  }

  isValid() {
    return isValidMcsDate(this.value);
  }

  toString() {
    return this.value;
  }
}
