import cuid from 'cuid';
import { isQueryListModel } from '../../../../models/datamart/graphdb/OTQLResult';
import {
  AbstractListQueryModel,
  AbstractQueryModel,
  OTQLQueryModel,
  QueryModelType,
  SerieQueryModel,
} from '../QueryToolTab';
import { McsTabsItem } from '../QueryToolTabsContainer';
import { getChartDataset } from './ChartOptionsUtils';

export const DEFAULT_OTQL_QUERY = 'SELECT @count{} FROM UserPoint';

export function getNewSerieQuery(name: string, defaultOtqlValue?: string): SerieQueryModel {
  return {
    id: cuid(),
    type: 'otql',
    queryModel: { query: defaultOtqlValue || '' },
    name: name,
  };
}

export function getNewSubSerieQuery(
  name: string,
  defaultValue?: string | AbstractQueryModel,
  type?: QueryModelType,
): AbstractListQueryModel {
  if (defaultValue && typeof defaultValue !== 'string' && type) {
    return {
      id: cuid(),
      type: type,
      queryModel: defaultValue,
      name: name,
    };
  } else
    return {
      id: cuid(),
      type: 'otql',
      queryModel: defaultValue
        ? typeof defaultValue === 'string'
          ? { query: defaultValue }
          : defaultValue
        : { query: '' },
      name: name,
    };
}

export const getSources = (tabQuery: McsTabsItem) => {
  const getSourcesFromQueryModel = (serieQuery: SerieQueryModel) => {
    const queryKey = !serieQuery.type || serieQuery.type === 'otql' ? 'query_text' : 'query_json';
    const queryValue =
      !serieQuery.type || serieQuery.type === 'otql'
        ? (serieQuery.queryModel as OTQLQueryModel).query
        : serieQuery.queryModel;
    const dataset = {
      [queryKey]: queryValue,
      type: serieQuery.type ? serieQuery.type : 'otql',
      series_title: serieQuery.name || 'count',
    };
    return getChartDataset(dataset, true, {});
  };

  return tabQuery.serieQueries.map(serieQuery => {
    if (!isQueryListModel(serieQuery.queryModel)) {
      return getSourcesFromQueryModel(serieQuery);
    } else {
      return {
        type: 'to-list',
        series_title: serieQuery.name,
        sources: (serieQuery.queryModel as AbstractListQueryModel[]).map(queryListModel => {
          return getSourcesFromQueryModel(queryListModel);
        }),
      };
    }
  });
};
