import queryString from 'query-string';
import lodash from 'lodash';
import moment from 'moment';
import {
  DATE_QUERY_SETTINGS
} from '../../services/RouteQuerySelectorService';

const CAMPAIGN_EMAIL_QUERY_SETTINGS = [
  ...DATE_QUERY_SETTINGS
];

export {
  CAMPAIGN_EMAIL_QUERY_SETTINGS
};


const DATE_FORMAT = 'YYYY-MM-DD';

export const PAGINATION_SEARCH_SETTINGS = [
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

export const KEYWORD_SEARCH_SETTINGS = [
  {
    paramName: 'keywords',
    defaultValue: '',
    deserialize: query => query.keywords,
    serialize: value => value,
    isValid: () => true
  }
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
    isValid: query => !query.statuses || query.statuses.split(',').length > 0
  },
  ...KEYWORD_SEARCH_SETTINGS
];

export const DATE_SEARCH_SETTINGS = [
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
  }
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
      ...params
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
    ...serializedParams
  });

};

/**
 * @param {String} search location.search
 * @param {Array} settings (optionnal) type settings
 * @returns the parsed search string into object
 */
export const parseSearch = (search, settings) => {
  const query = queryString.parse(search);
  if (!settings) return query;
  return settings.reduce((acc, setting) => ({
    ...acc,
    [setting.paramName]: setting.deserialize(query)
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
export const compareSearchs = (currentSearch, nextSearch) => {
  return lodash.isEqual(
        queryString.parse(currentSearch),
        queryString.parse(nextSearch)
    );
};
