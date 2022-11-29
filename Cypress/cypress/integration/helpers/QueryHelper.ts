import { postRequest } from './ApiHelper';

export type QueryLanguage = 'SELECTORQL' | 'OTQL' | 'JSON_OTQL';

export interface QueryCreateRequest {
  datamart_id: string;
  query_language: QueryLanguage;
  query_text: string;
}

export interface QueryResource extends QueryCreateRequest {
  id: string;
}

export async function createQuery(
  datamartId: number,
  query: QueryCreateRequest,
  access_token: string,
): Promise<QueryResource> {
  const endpoint = `datamarts/${datamartId}/queries`;
  return postRequest(endpoint, access_token, query).then(({ data: query }) => {
    return query;
  });
}
