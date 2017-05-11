import numeral from 'numeral';

export const formatMetric = (value, numeralFormat, prefix = '', suffix = '') => {
  const number = parseInt(value, 0);
  if (!isNaN(number)) {
    return `${prefix}${numeral(number).format(numeralFormat)}${suffix}`;
  }
  return '-';
};
