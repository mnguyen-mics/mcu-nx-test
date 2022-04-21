import cuid from 'cuid';
import { SerieQueryModel } from '../OTQLRequest';

export const DEFAULT_OTQL_QUERY = 'SELECT @count{} FROM UserPoint';

export function getNewSerieQuery(name: string, defaultValue?: string): SerieQueryModel {
  return {
    id: cuid(),
    query: defaultValue || '',
    serieName: name,
  };
}
