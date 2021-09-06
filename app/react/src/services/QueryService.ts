import ApiService, { DataResponse, DataListResponse } from './ApiService';
import {
  QueryResource,
  QueryTranslationResource,
  QueryTranslationRequest,
  AutoCompleteResource,
  ErrorQueryResource,
} from '../models/datamart/DatamartResource';
import {
  OTQLResult,
  QueryPrecisionMode,
  GraphQLResult,
} from '../models/datamart/graphdb/OTQLResult';
import { QueryDocument } from '../models/datamart/graphdb/QueryDocument';
import log from '../utils/Logger';
import { injectable } from 'inversify';

export interface IQueryService {
  getQuery: (datamartId: string, queryId: string) => Promise<DataResponse<QueryResource>>;

  createQuery: (
    datamartId: string,
    query: Partial<QueryResource>,
  ) => Promise<DataResponse<QueryResource>>;

  updateQuery: (
    datamartId: string,
    queryId: string,
    query: Partial<QueryResource>,
  ) => Promise<DataResponse<QueryResource>>;

  runOTQLQuery: (
    datamartId: string,
    query: string,
    options?: {
      index_name?: string;
      query_id?: string;
      limit?: number;
      offset?: number;
      graphql_select?: boolean;
      use_cache?: boolean;
      precision?: QueryPrecisionMode;
      content_type?: string;
    },
  ) => Promise<DataResponse<OTQLResult>>;

  runGraphQLQuery: (
    datamartId: string,
    query: string,
    options?: {
      use_cache?: boolean;
    },
  ) => Promise<DataResponse<GraphQLResult>>;

  runJSONOTQLQuery: (
    datamartId: string,
    query: QueryDocument,
    options?: {
      index_name?: string;
      query_id?: string;
      limit?: number;
      offset?: number;
      precision?: QueryPrecisionMode;
      use_cache?: boolean;
    },
  ) => Promise<DataResponse<OTQLResult>>;

  runSelectorQLQuery: (datamartId: string) => Promise<DataResponse<{ total: number }>>;

  autocompleteOtqlQuery: (
    datamartId: string,
    query: string,
    row: number,
    col: number,
  ) => Promise<AutoCompleteResource[] | undefined>;

  checkOtqlQuery: (datamartId: string, query: string) => Promise<DataResponse<ErrorQueryResource>>;

  translateQuery: (
    datamartId: string,
    query: QueryTranslationRequest,
  ) => Promise<DataResponse<QueryTranslationResource>>;

  getWhereClause: (datamartId: string, queryId: string) => Promise<DataResponse<string>>;
}

@injectable()
export class QueryService implements IQueryService {
  getQuery(datamartId: string, queryId: string): Promise<DataResponse<QueryResource>> {
    const endpoint = `datamarts/${datamartId}/queries/${queryId}`;
    return ApiService.getRequest(endpoint);
  }

  createQuery(
    datamartId: string,
    query: Partial<QueryResource>,
  ): Promise<DataResponse<QueryResource>> {
    const endpoint = `datamarts/${datamartId}/queries`;
    return ApiService.postRequest(endpoint, query);
  }

  updateQuery(
    datamartId: string,
    queryId: string,
    query: Partial<QueryResource>,
  ): Promise<DataResponse<QueryResource>> {
    const endpoint = `datamarts/${datamartId}/queries/${queryId}`;
    return ApiService.putRequest(endpoint, query);
  }

  runOTQLQuery(
    datamartId: string,
    query: string,
    options: {
      index_name?: string;
      query_id?: string;
      limit?: number;
      offset?: number;
      graphql_select?: boolean;
      use_cache?: boolean;
      precision?: QueryPrecisionMode;
      content_type?: string;
    } = {},
  ): Promise<DataResponse<OTQLResult>> {
    const endpoint = `datamarts/${datamartId}/query_executions/otql`;

    const headers = {
      'Content-Type': `${
        options.content_type ? options.content_type : 'text/plain; charset=utf-8'
      }`,
    }; // to finish
    return ApiService.postRequest(endpoint, query, options, headers);
  }

  runGraphQLQuery(
    datamartId: string,
    query: string,
    options: {
      use_cache?: boolean;
    } = {},
  ): Promise<DataResponse<GraphQLResult>> {
    const endpoint = `datamarts/${datamartId}/query_executions/graphql`;
    const headers = { 'Content-Type': 'text/plain; charset=utf-8' };
    return ApiService.postRequest(endpoint, query, options, headers);
  }

  runJSONOTQLQuery(
    datamartId: string,
    query: QueryDocument,
    options: {
      index_name?: string;
      query_id?: string;
      limit?: number;
      offset?: number;
      use_cache?: boolean;
      precision?: QueryPrecisionMode;
    } = {},
  ): Promise<DataResponse<OTQLResult>> {
    const endpoint = `datamarts/${datamartId}/query_executions/jsonotql`;
    return ApiService.postRequest(endpoint, query, options);
  }

  // TODO add query body and return type
  runSelectorQLQuery(datamartId: string): Promise<DataResponse<{ total: number }>> {
    const endpoint = `datamarts/${datamartId}/query_executions`;
    return ApiService.postRequest(endpoint, {});
  }

  autocompleteOtqlQuery(
    datamartId: string,
    query: string,
    row: number,
    col: number,
  ): Promise<AutoCompleteResource[] | undefined> {
    const endpoint = `datamarts/${datamartId}/query_autocomplete/otql`;
    return ApiService.postRequest<DataListResponse<AutoCompleteResource>>(endpoint, {
      query,
      position: {
        row: row,
        col: col,
      },
    })
      .then(res => res.data)
      .catch(() => {
        log.warn('cannot resolve autocompleters');
        return undefined;
      });
  }

  checkOtqlQuery(datamartId: string, query: string): Promise<DataResponse<ErrorQueryResource>> {
    const payload = {
      query: query,
    };
    return ApiService.postRequest(`datamarts/${datamartId}/query_check/otql`, payload);
  }

  translateQuery(
    datamartId: string,
    query: QueryTranslationRequest,
  ): Promise<DataResponse<QueryTranslationResource>> {
    const endpoint = `datamarts/${datamartId}/query_translations`;
    return ApiService.postRequest(endpoint, query);
  }

  getWhereClause(datamartId: string, queryId: string): Promise<DataResponse<any>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/queries/${queryId}/object_tree_expression`,
    );
  }
}
