import { compose, withProps } from 'recompose';

function normalizeFloat(value, prevValue) {
  return (!value || (value && value.length < 16 && /^[0-9]+(\.([0-9]{1,2})?)?$/i.test(value))
    ? value
    : prevValue
  );
}

function normalizeInteger(value, prevValue) {
  return (!value || (value && value.length < 16 && /^\d+$/.test(value))
    ? value
    : prevValue
  );
}

export default compose(
  withProps(() => ({
    fieldNormalizer: {
      normalizeFloat,
      normalizeInteger,
    },
  })),
);
