import ApiService, { DataResponse } from './ApiService';
import { QueryResource } from '../models/datamart/DatamartResource';
import { OTQLResult } from '../models/datamart/graphdb/OTQLResult';
import { QueryDocument } from '../models/datamart/graphdb/QueryDocument';

const QueryService = {
  getQuery(
    datamartId: string,
    queryId: string,
  ): Promise<DataResponse<QueryResource>> {
    const endpoint = `datamarts/${datamartId}/queries/${queryId}`;
    return ApiService.getRequest(endpoint);
  },
  createQuery(
    datamartId: string,
    query: Partial<QueryResource>,
  ): Promise<DataResponse<QueryResource>> {
    const endpoint = `datamarts/${datamartId}/queries`;
    return ApiService.postRequest(endpoint, query);
  },
  updateQuery(
    datamartId: string,
    queryId: string,
    query: Partial<QueryResource>,
  ): Promise<DataResponse<QueryResource>> {
    const endpoint = `datamarts/${datamartId}/queries/${queryId}`;
    return ApiService.putRequest(endpoint, query);
  },

  runOTQLQuery(
    datamartId: string,
    query: string,
    options: {
      index_name?: string;
      query_id?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<DataResponse<OTQLResult>> {
    const endpoint = `datamarts/${datamartId}/query_executions/otql`;
    const headers = { 'Content-Type': 'text/plain; charset=utf-8' };
    return ApiService.postRequest(endpoint, query, options, headers);
  },

  runJSONOTQLQuery(
    datamartId: string,
    query: QueryDocument,
    options: {
      index_name?: string;
      query_id?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<DataResponse<OTQLResult>> {
    const endpoint = `datamarts/${datamartId}/query_executions/jsonotql`;
    return ApiService.postRequest(endpoint, query, options);
  },

  // TODO add query body and return type
  runSelectorQLQuery(
    datamartId: string,
  ): Promise<DataResponse<{ total: number }>> {
    const endpoint = `datamarts/${datamartId}/query_executions`;
    return ApiService.postRequest(endpoint, {});
  }
};

export default QueryService;
