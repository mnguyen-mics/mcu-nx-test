import { compose, withProps } from 'recompose';

import { formatMetric } from '../../utils/MetricHelper';

function formatToNumber(value) {
  return (value ? formatMetric(value) : 0);
}

function isNotTooLongNumber(value, prevValue) {
  // const formattedValue = value.replace(/,/g, '');
  return (!value || (value && value.length < 16)
    ? value
    : prevValue
  );
}

// function normalizeNumber(value, prevValue) {
//   const number = isNumber(value, prevValue);
//   return (number === prevValue ? number : formatToNumber(number));
// }

export default compose(
  withProps(() => ({
    fieldNormalizer: {
      formatToNumber,
      isNotTooLongNumber,
      // isNumber,
      // normalizeNumber,
    },
  })),
);
