import { compose, withProps } from 'recompose';

function normalizeNumber(value, prevValue) {
  return (!value || (value && value.length < 16)
    ? value
    : prevValue
  );
}

export default compose(
  withProps(() => ({
    fieldNormalizer: {
      normalizeNumber,
    },
  })),
);
