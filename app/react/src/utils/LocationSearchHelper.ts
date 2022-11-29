import queryString from 'query-string';
import lodash from 'lodash';
import McsMoment from './McsMoment';
import { Index } from '.';

function getOrSetInitialSessionValue(value: McsMoment, key: string): McsMoment {
  if (window.sessionStorage && window.sessionStorage.getItem(key)) {
    return new McsMoment(window.sessionStorage.getItem(key) as string);
  } else {
    if (window.sessionStorage) window.sessionStorage.setItem(key, value.raw() as string);
    return value;
  }
}

function setSessionValue(value: McsMoment, key: string) {
  if (window.sessionStorage) window.sessionStorage.setItem(key, value.raw() as string);
}

const defaultFromValue = getOrSetInitialSessionValue(new McsMoment('now-7d'), 'from');
const defaultToValue = getOrSetInitialSessionValue(new McsMoment('now'), 'to');

export interface SearchSetting {
  paramName: string;
  defaultValue: any;
  deserialize: (query: Index<any>) => any;
  serialize: (value: any) => string;
  isValid: (query: Index<any>) => boolean;
}

export const LABELS_SEARCH_SETTINGS: SearchSetting[] = [
  {
    paramName: 'label_id',
    defaultValue: [],
    deserialize: (query: Index<string>) => {
      if (query.label_id) {
        return query.label_id.split(',');
      }
      return [];
    },
    serialize: (value: string[]) => value.join(','),
    isValid: (query: Index<string>) => !query.label_id || query.label_id.split(',').length > 0,
  },
];

export interface LabelsSearchSettings {
  label_id: string[];
}

export const TAB_SEARCH_SETTINGS: SearchSetting[] = [
  {
    paramName: 'tab',
    defaultValue: 'site',
    deserialize: (query: Index<string>) => query.tab,
    serialize: (value: string) => value,
    isValid: (query: Index<string>) => !!query,
  },
];

export interface TabSearchSettings {
  tab: string;
}

export const PAGINATION_SEARCH_SETTINGS: SearchSetting[] = [
  {
    paramName: 'currentPage',
    defaultValue: 1,
    deserialize: (query: Index<string>) => parseInt(query.currentPage, 0),
    serialize: (value: number) => value.toString(),
    isValid: (query: Index<string>) =>
      !!(query.currentPage && !isNaN(parseInt(query.currentPage, 0))),
  },
  {
    paramName: 'pageSize',
    defaultValue: 10,
    deserialize: (query: Index<string>) => parseInt(query.pageSize, 0),
    serialize: (value: number) => value.toString(),
    isValid: (query: Index<string>) => !!(query.pageSize && !isNaN(parseInt(query.pageSize, 0))),
  },
];

export interface PaginationSearchSettings {
  currentPage: number;
  pageSize: number;
}

export const KEYWORD_SEARCH_SETTINGS: SearchSetting[] = [
  {
    paramName: 'keywords',
    defaultValue: '',
    deserialize: (query: Index<string>) => query.keywords,
    serialize: (value: string) => value,
    isValid: () => true,
  },
];

export const SET_PASSWORD_SEARCH_SETTINGS: SearchSetting[] = [
  {
    paramName: 'email',
    defaultValue: '',
    deserialize: (query: Index<string>) => query.email,
    serialize: (value: string) => value,
    isValid: () => true,
  },
  {
    paramName: 'token',
    defaultValue: '',
    deserialize: (query: Index<string>) => query.token,
    serialize: (value: string) => value,
    isValid: () => true,
  },
];

export interface KeywordSearchSettings {
  keywords: string;
}

export interface TypeSearchSettings {
  type: string[];
}

export const FILTERS_SEARCH_SETTINGS: SearchSetting[] = [
  {
    paramName: 'statuses',
    defaultValue: [],
    deserialize: (query: Index<string>) => {
      if (query.statuses) {
        return query.statuses.split(',');
      }
      return [];
    },
    serialize: (value: string[]) => value.join(','),
    isValid: (query: Index<string>) => !query.statuses || query.statuses.split(',').length > 0,
  },
];

export interface FiltersSearchSettings extends KeywordSearchSettings {
  statuses: string[];
}

export const SEGMENTS_FILTERS_SEARCH_SETTINGS: SearchSetting[] = [
  {
    paramName: 'segments',
    defaultValue: [''],
    deserialize: (query: Index<string>) => {
      if (query.segments) {
        return query.segments.split(',');
      }
      return [];
    },
    serialize: (value: string[]) => value.join(','),
    isValid: (query: Index<string>) =>
      !!(query.segments && (query.segments.length === 0 || query.segments.split(',').length > 0)),
  },
];

export interface SegmentsFiltersSearchSettings extends KeywordSearchSettings {
  segments: string[];
}

export const DATE_SEARCH_SETTINGS: SearchSetting[] = [
  {
    paramName: 'from',
    defaultValue: defaultFromValue,
    deserialize: (query: Index<string>) => new McsMoment(query.from),
    serialize: (value: McsMoment) => {
      setSessionValue(value, 'from');
      return value.raw() as string;
    },
    isValid: (query: Index<string>) =>
      !!(query.from && query.from.length && new McsMoment(query.from).isValid()),
  },
  {
    paramName: 'to',
    defaultValue: defaultToValue,
    deserialize: (query: Index<string>) => new McsMoment(query.to),
    serialize: (value: McsMoment) => {
      setSessionValue(value, 'to');
      return value.raw() as string;
    },
    isValid: (query: Index<string>) =>
      !!(query.to && query.to.length && new McsMoment(query.to).isValid()),
  },
];

// For last 7days filter without current day
export const DATE_SEARCH_SETTINGS_WITHOUT_CURRENT_DAY: SearchSetting[] = [
  {
    paramName: 'from',
    defaultValue: new McsMoment('now-8d'),
    deserialize: (query: Index<string>) => new McsMoment(query.from),
    serialize: (value: McsMoment) => {
      setSessionValue(value, 'from');
      return value.raw() as string;
    },
    isValid: (query: Index<string>) =>
      !!(query.from && query.from.length && new McsMoment(query.from).isValid()),
  },
  {
    paramName: 'to',
    defaultValue: new McsMoment('now-1d'),
    deserialize: (query: Index<string>) => new McsMoment(query.to),
    serialize: (value: McsMoment) => {
      setSessionValue(value, 'to');
      return value.raw() as string;
    },
    isValid: (query: Index<string>) =>
      !!(query.to && query.to.length && new McsMoment(query.to).isValid()),
  },
];

export const convertTimestampToDayNumber = (comparisonStartDate: number) => {
  const comparisonDurationInSeconds = (Date.now() - comparisonStartDate) / 1000;
  const comparisonDurationInDays = Math.floor(comparisonDurationInSeconds / (3600 * 24));
  return comparisonDurationInDays;
};

export const getComparisonDateSearchSettings = (comparisonStartDate: number) => {
  return [
    {
      paramName: 'from',
      defaultValue: new McsMoment(`now-${convertTimestampToDayNumber(comparisonStartDate)}d`),
      deserialize: (query: Index<string>) => new McsMoment(query.from),
      serialize: (value: McsMoment) => {
        setSessionValue(value, 'from');
        return value.raw() as string;
      },
      isValid: (query: Index<string>) =>
        !!(
          query.from &&
          query.from.length &&
          new McsMoment(query.from).isValid() &&
          new McsMoment(query.from).toMoment() >
            new McsMoment(`now-${convertTimestampToDayNumber(comparisonStartDate)}d`).toMoment()
        ),
    },
    {
      paramName: 'to',
      defaultValue: new McsMoment('now-1d'),
      deserialize: (query: Index<string>) => new McsMoment(query.to),
      serialize: (value: McsMoment) => {
        setSessionValue(value, 'to');
        return value.raw() as string;
      },
      isValid: (query: Index<string>) =>
        !!(query.to && query.to.length && new McsMoment(query.to).isValid()) &&
        new McsMoment(query.to).toMoment() > new McsMoment(query.from).toMoment(),
    },
  ];
};

export interface DateSearchSettings {
  from: McsMoment;
  to: McsMoment;
}

export interface SegmentsSearchSettings {
  segments: string[];
}

export interface AllUsersSettings {
  allusers: boolean;
}

export const ARCHIVED_SEARCH_SETTINGS: SearchSetting[] = [
  {
    paramName: 'archived',
    defaultValue: false,
    deserialize: (query: Index<string>) => query.archived === 'true',
    serialize: (value: boolean) => value.toString(),
    isValid: (query: Index<string>) => {
      return query.archived === 'true' || query.archived === 'false';
    },
  },
];

export const ALL_USERS: SearchSetting[] = [
  {
    paramName: 'allusers',
    defaultValue: true,
    deserialize: (query: Index<string>) => query.allusers === 'true',
    serialize: (value: boolean) => value.toString(),
    isValid: (query: Index<string>) => {
      return query.allusers === 'true' || query.allusers === 'false';
    },
  },
];

export const DATAMART_SEARCH_SETTINGS: SearchSetting[] = [
  {
    paramName: 'datamartId',
    defaultValue: '',
    deserialize: query => {
      return query.datamartId;
    },
    serialize: (value: any) => value,
    isValid: () => true,
  },
];

export const SORT_SEARCH_SETTINGS: SearchSetting[] = [
  {
    paramName: 'orderBy',
    defaultValue: '',
    deserialize: query => {
      return query.orderBy;
    },
    serialize: (value: any) => value,
    isValid: () => true,
  },
];

export interface DatamartSearchSettings {
  datamartId?: string;
}

export interface ArchivedSearchSettings {
  archived: boolean;
}

export const isSearchValid = (search: string, settings: SearchSetting[]) => {
  const query = queryString.parse(search);
  // notEmpty and must forall settings query isValid
  return (
    Object.keys(query).length > 0 &&
    settings.reduce((acc, setting) => {
      return acc && setting.isValid(query);
    }, true)
  );
};

// add missing and/or replace invalid params with default value
export const buildDefaultSearch = (existingSearch: string, settings: SearchSetting[]) => {
  const existingQuery = queryString.parse(existingSearch);
  const defaultQuery = settings.reduce((acc, setting) => {
    const newAcc: any = acc;
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
export const updateSearch = (search: string, params: Index<any>, settings?: SearchSetting[]) => {
  const query = queryString.parse(search);

  if (!settings) {
    // No settings provided, basic search string constuction
    return queryString.stringify({
      ...query,
      ...params,
    });
  }

  const serializedParams = Object.keys(params).reduce((acc, paramName) => {
    const newAcc: any = acc;
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
export function parseSearch<T = Index<any>>(search: string, settings?: SearchSetting[]): T {
  const query = queryString.parse(search);
  if (!settings) return query as any;
  return settings.reduce(
    (acc, setting) => ({
      ...acc,
      [setting.paramName]: setting.deserialize(query),
    }),
    {},
  ) as T;
}

/**
 * Compare two searchs strings coming from location api
 * by converting to object using query-string lib
 *
 * @param {String} currentSearch
 * @param {String} nextSearch
 * @returns true if two objects are equals
 */
export const compareSearches = (currentSearch: string, nextSearch: string) => {
  return lodash.isEqual(queryString.parse(currentSearch), queryString.parse(nextSearch));
};
