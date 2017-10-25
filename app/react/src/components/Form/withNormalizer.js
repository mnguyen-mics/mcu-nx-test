import { compose, withProps } from 'recompose';

import { formatMetric } from '../../utils/MetricHelper';

function formatToNumber(value) {
  return (value ? formatMetric(value) : 0);
}

function isNumber(value, prevValue) {
  const formattedValue = value.replace(/,/g, '');
  return (!value || (value && formattedValue.length < 16 && /^\d+$/.test(formattedValue))
    ? formattedValue
    : prevValue
  );
}

function normalizeNumber(value, prevValue) {
  const number = isNumber(value, prevValue);
  return (number === prevValue ? number : formatToNumber(number));
}

export default compose(
  withProps(() => ({
    fieldNormalizer: {
      formatToNumber,
      isNumber,
      normalizeNumber,
    },
  })),
);
