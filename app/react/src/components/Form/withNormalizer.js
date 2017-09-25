import { compose, withProps } from 'recompose';

const isNumber = (value, prevValue) => {
  const formattedValue = value.replace(/,/g, '');

  return (value && formattedValue.length < 16 && /^\d+$/.test(formattedValue, '')
    ? value
    : prevValue
  );
};

export default compose(
  withProps(() => ({
    fieldNormalizer: {
      isNumber,
    },
  })),
);
