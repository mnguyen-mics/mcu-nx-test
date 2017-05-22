export const AUTOMATIONS_LIST_SETTINGS = [
  {
    paramName: 'currentPage',
    defaultValue: 1,
    deserialize: query => parseInt(query.currentPage, 0),
    serialize: value => value.toString(),
    isValid: query => query.currentPage && !isNaN(parseInt(query.currentPage, 0))
  },
  {
    paramName: 'pageSize',
    defaultValue: 10,
    deserialize: query => parseInt(query.pageSize, 0),
    serialize: value => value.toString(),
    isValid: query => query.pageSize && !isNaN(parseInt(query.pageSize, 0))
  }
];

export const isQueryValid = (query = {}, settings) => {
  // notEmpty and must forall settings query isValid
  return Object.keys(query).length > 0 &&
    settings.reduce((acc, setting) => {
      return acc && setting.isValid(query);
    }, true);
};

// add missing and/or replace invalid params with default value
export const buildDefaultQuery = (existingQuery = {}, settings) => {
  return settings.reduce((acc, setting) => {
    if (setting.isValid(existingQuery)) {
      acc[setting.paramName] = existingQuery[setting.paramName]; // eslint-disable-line no-param-reassign
    } else {
      acc[setting.paramName] = setting.serialize(setting.defaultValue); // eslint-disable-line no-param-reassign
    }
    return acc;
  }, {});
};

// merge query with serialized params object
export const updateQueryWithParams = (query, params, settings) => {
  const serializedParams = Object.keys(params).reduce((acc, paramName) => {
    const setting = settings.find(s => s.paramName === paramName);
    if (setting) {
      acc[paramName] = setting.serialize(params[paramName]); // eslint-disable-line no-param-reassign
    }
    return acc;
  }, {});
  return {
    ...query,
    ...serializedParams
  };
};

// run deserialize function on object keys and return a new object
export const deserializeQuery = (query, settings) => {
  return settings.reduce((acc, setting) => {
    acc[setting.paramName] = setting.deserialize(query); // eslint-disable-line no-param-reassign
    return acc;
  }, {});
};

