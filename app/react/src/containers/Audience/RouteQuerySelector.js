import moment from 'moment';

const DATE_FORMAT = 'YYYY-MM-DD';

export const AUDIENCE_SEGMENTS_SETTINGS = [
  {
    paramName: 'currentPage',
    defaultValue: 1,
    deserialize: query => parseInt(query.currentPage, 0),
    serialize: value => value.toString(),
    isValid: query => query.currentPage && !isNaN(parseInt(query.currentPage, 0))
  },
  {
    paramName: 'pageSize',
    defaultValue: 200,
    deserialize: query => parseInt(query.pageSize, 0),
    serialize: value => value.toString(),
    isValid: query => query.pageSize && !isNaN(parseInt(query.pageSize, 0))
  },
  {
    paramName: 'keywords',
    defaultValue: '',
    deserialize: query => query.keywords,
    serialize: value => value,
    isValid: () => true
  },
  {
    paramName: 'rangeType',
    defaultValue: 'relative',
    deserialize: query => query.rangeType,
    serialize: value => value,
    isValid: query => query.rangeType
  },
  {
    paramName: 'lookbackWindow',
    defaultValue: moment.duration(7, 'days'),
    deserialize: query => moment.duration(parseInt(query.lookbackWindow, 0), 'seconds'),
    serialize: value => Math.ceil(value.asSeconds()),
    isValid: query => query.lookbackWindow
  },
  {
    paramName: 'from',
    defaultValue: moment().subtract(7, 'days'),
    deserialize: query => moment(query.from, DATE_FORMAT),
    serialize: value => value.format(DATE_FORMAT),
    isValid: query => moment(query.from, DATE_FORMAT).isValid()
  },
  {
    paramName: 'to',
    defaultValue: moment(),
    deserialize: query => moment(query.to, DATE_FORMAT),
    serialize: value => value.format(DATE_FORMAT),
    isValid: query => moment(query.to, DATE_FORMAT).isValid()
  },
  {
    paramName: 'types',
    defaultValue: [],
    deserialize: query => {
      if (query.types) {
        return query.types.split(',');
      }
      return [];
    },
    serialize: value => value.join(','),
    isValid: query => !query.types || query.types.split(',').length > 0
  },
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
    const newAcc = acc;
    if (setting.isValid(existingQuery)) {
      newAcc[setting.paramName] = existingQuery[setting.paramName];
    } else {
      newAcc[setting.paramName] = setting.serialize(setting.defaultValue);
    }
    return newAcc;
  }, {});
};

// merge query with serialized params object
export const updateQueryWithParams = (query, params, settings) => {
  const serializedParams = Object.keys(params).reduce((acc, paramName) => {
    const newAcc = acc;
    const setting = settings.find(s => s.paramName === paramName);
    if (setting) {
      newAcc[paramName] = setting.serialize(params[paramName]);
    }
    return newAcc;
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

