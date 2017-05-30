export const CREATIVE_DISPLAY_LIST_SETTINGS = [
  {
    paramName: 'currentPage',
    defaultValue: 1,
    deserialize: query => parseInt(query.currentPage, 0),
    serialize: value => value.toString(),
    isValid: query => query.currentPage && !isNaN(parseInt(query.currentPage, 0))
  },
  {
    paramName: 'pageSize',
    defaultValue: 1000,
    deserialize: query => parseInt(query.pageSize, 0),
    serialize: value => value.toString(),
    isValid: query => query.pageSize && !isNaN(parseInt(query.pageSize, 0))
  },
  {
    paramName: 'statuses',
    defaultValue: [],
    deserialize: query => {
      if (query.statuses) {
        return query.statuses.split(',');
      }
      return [];
    },
    serialize: value => value.join(','),
    isValid: query => !query.statuses || query.statuses.split(',').length > 0
  },
];

export const CREATIVE_EMAILS_LIST_SETTINGS = [
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
    const paramValue = setting.isValid(existingQuery) ? existingQuery[setting.paramName] : setting.serialize(setting.defaultValue);
    return {
      ...acc,
      [setting.paramName]: paramValue
    };
  }, {});
};

// merge query with serialized params object
export const updateQueryWithParams = (query, params, settings) => {
  const serializedParams = Object.keys(params).reduce((acc, paramName) => {
    const setting = settings.find(s => s.paramName === paramName);
    if (setting) {
      return {
        ...acc,
        [paramName]: setting.serialize(params[paramName])
      };
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
  return settings.reduce((acc, setting) => ({
    ...acc,
    [setting.paramName]: setting.deserialize(query)
  }), {});
};

