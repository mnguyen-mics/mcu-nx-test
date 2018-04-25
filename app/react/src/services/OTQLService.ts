import ApiService, { DataResponse } from './ApiService';
import { OTQLResult } from '../models/datamart/graphdb/OTQLResult';
import { QueryDocument } from '../models/datamart/graphdb/QueryDocument';

const OTQLService = {
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
};

export default OTQLService;
