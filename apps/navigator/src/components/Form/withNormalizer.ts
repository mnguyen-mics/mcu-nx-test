import { compose, withProps } from 'recompose';
import { Normalizer } from 'redux-form';

export interface FieldNormalizerProps {
  normalizeFloat: Normalizer;
  normalizeInteger: Normalizer;
}

export interface NormalizerProps {
  fieldNormalizer: FieldNormalizerProps;
}

function normalizeFloat(value: any, prevValue: any): Normalizer {
  return !value || (value && value.length < 16 && /^[0-9]+(\.([0-9]{1,2})?)?$/i.test(value))
    ? value
    : prevValue;
}

function normalizeInteger(value: any, prevValue: any): Normalizer {
  return !value || (value && value.length < 16 && /^\d+$/.test(value)) ? value : prevValue;
}

export default compose<{}, NormalizerProps>(
  withProps(() => ({
    fieldNormalizer: {
      normalizeFloat,
      normalizeInteger,
    },
  })),
);
