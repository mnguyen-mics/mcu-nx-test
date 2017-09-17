import { toPascalCase } from './StringHelper';

function filterEmptyValues({ data, neededKeys }) {
  const keys = Object.keys(data);

  return keys.filter(key => (
    (neededKeys || keys).includes(key)
    && data[key] !== undefined
    && data[key] !== null
  ));
}

function formatKeysToPascalCase({ data, prefix = '' }) {
  return Object.keys(data).reduce((formattedInitialValues, key) => ({
    ...formattedInitialValues,
    [`${prefix}${toPascalCase(key)}`]: data[key],
  }), {});
}

export {
  filterEmptyValues,
  formatKeysToPascalCase,
};
