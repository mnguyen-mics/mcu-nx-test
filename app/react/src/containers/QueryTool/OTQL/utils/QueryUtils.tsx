import cuid from 'cuid';
import { QueryListModel, SerieQueryModel } from '../OTQLRequest';

export const DEFAULT_OTQL_QUERY = 'SELECT @count{} FROM UserPoint';

export function getNewSerieQuery(
  name: string,
  defaultValue?: string | QueryListModel[],
): SerieQueryModel {
  return {
    id: cuid(),
    queryModel: defaultValue || '',
    name: name,
  };
}

export function getNewSubSerieQuery(name: string, defaultValue?: string): QueryListModel {
  return {
    id: cuid(),
    query: defaultValue || '',
    name: name,
  };
}
