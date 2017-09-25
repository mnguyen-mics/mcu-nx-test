import { compose, withProps } from 'recompose';

const isNumber = (value, prevValue) => {
  const formattedValue = value.replace(/,/g, '');

  return (
    value && /^\d+$/.test(formattedValue, '') ? value : prevValue
  );
};

export default compose(
  withProps(() => ({
    fieldNormalizer: {
      isNumber,
    },
  })),
);
