function filterEmptyValues(data) {
  const keys = Object.keys(data);

  return keys.filter(key => data[key] !== undefined && data[key] !== null);
}

export {
  filterEmptyValues,
};
