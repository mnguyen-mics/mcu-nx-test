import queryString from 'query-string';
import lodash from 'lodash';
import McsMoment from './McsMoment.ts';

export const LABELS_SEARCH_SETTINGS = [{
  paramName: 'label_id',
  defaultValue: [],
  deserialize: query => {
    if (query.label_id) {
      return query.label_id.split(',');
    }
    return [];
  },
  serialize: value => value.join(','),
  isValid: query => !query.label_id || query.label_id.split(',').length > 0,
}];

export const SETTINGS_PAGINATION_SEARCH_SETTINGS = [{
  paramName: 'tab',
  defaultValue: 'site',
  deserialize: query => query.tab,
  serialize: value => value,
  isValid: query => query,
}];

export const PAGINATION_SEARCH_SETTINGS = [
  {
    paramName: 'currentPage',
    defaultValue: 1,
    deserialize: query => parseInt(query.currentPage, 0),
    serialize: value => value.toString(),
    isValid: query => query.currentPage && !isNaN(parseInt(query.currentPage, 0)),
  },
  {
    paramName: 'pageSize',
    defaultValue: 10,
    deserialize: query => parseInt(query.pageSize, 0),
    serialize: value => value.toString(),
    isValid: query => query.pageSize && !isNaN(parseInt(query.pageSize, 0)),
  },
];

export const KEYWORD_SEARCH_SETTINGS = [
  {
    paramName: 'keywords',
    defaultValue: '',
    deserialize: query => query.keywords,
    serialize: value => value,
    isValid: () => true,
  },
];

export const FILTERS_SEARCH_SETTINGS = [
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
    isValid: query => !query.statuses || query.statuses.split(',').length > 0,
  },
  ...KEYWORD_SEARCH_SETTINGS,
];

export const DATE_SEARCH_SETTINGS = [
  {
    paramName: 'from',
    defaultValue: new McsMoment('now-7d'),
    deserialize: query => new McsMoment(query.from),
    serialize: value => value.raw(),
    isValid: query => query.from && query.from.length && new McsMoment(query.from).isValid(),
  },
  {
    paramName: 'to',
    defaultValue: new McsMoment('now'),
    deserialize: query => new McsMoment(query.to),
    serialize: value => value.raw(),
    isValid: query => query.to && query.to.length && new McsMoment(query.to).isValid(),
  }
];

export const ARCHIVED_SEARCH_SETTINGS = [
  {
    paramName: 'archived',
    defaultValue: false,
    deserialize: query => query.archived === 'true',
    serialize: value => value.toString(),
    isValid: query => {
      return (query.archived === 'true' || query.archived === 'false');
    },
  },
];

export const isSearchValid = (search, settings) => {
  const query = queryString.parse(search);
  // notEmpty and must forall settings query isValid
  return Object.keys(query).length > 0 &&
        settings.reduce((acc, setting) => {
          return acc && setting.isValid(query);
        }, true);
};

// add missing and/or replace invalid params with default value
export const buildDefaultSearch = (existingSearch, settings) => {
  const existingQuery = queryString.parse(existingSearch);
  const defaultQuery = settings.reduce((acc, setting) => {
    const newAcc = acc;
    if (setting.isValid(existingQuery)) {
      newAcc[setting.paramName] = existingQuery[setting.paramName];
    } else if (typeof setting.defaultValue === 'function') {
      newAcc[setting.paramName] = setting.serialize(setting.defaultValue());
    } else {
      newAcc[setting.paramName] = setting.serialize(setting.defaultValue);
    }
    return newAcc;
  }, {});
  return queryString.stringify(defaultQuery);
};

// merge query with serialized params object
export const updateSearch = (search, params, settings) => {
  const query = queryString.parse(search);

  if (!settings) {
    // No settings provided, basic search string constuction
    return queryString.stringify({
      ...query,
      ...params,
    });
  }

  const serializedParams = Object.keys(params).reduce((acc, paramName) => {
    const newAcc = acc;
    const setting = settings.find(s => s.paramName === paramName);
    if (setting) {
      newAcc[paramName] = setting.serialize(params[paramName]);
    }
    return newAcc;
  }, {});
  return queryString.stringify({
    ...query,
    ...serializedParams,
  });

};

/**
 * @param {String} search location.search
 * @param {Array} settings (optional) type settings
 * @returns the parsed search string into object
 */
export const parseSearch = (search, settings) => {
  const query = queryString.parse(search);
  if (!settings) return query;
  return settings.reduce((acc, setting) => ({
    ...acc,
    [setting.paramName]: setting.deserialize(query),
  }), {});
};


/**
 * Compare two searchs strings coming from location api
 * by converting to object using query-string lib
 *
 * @param {String} currentSearch
 * @param {String} nextSearch
 * @returns true if two objects are equals
 */
export const compareSearches = (currentSearch, nextSearch) => {
  return lodash.isEqual(
    queryString.parse(currentSearch),
    queryString.parse(nextSearch),
  );
};
