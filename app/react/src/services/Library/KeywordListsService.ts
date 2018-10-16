import { injectable } from 'inversify';
import { KeywordResource } from './../../models/keywordList/keywordList';
import ApiService, { DataResponse, DataListResponse } from '../ApiService';
import { KeywordListResource } from '../../models/keywordList/keywordList';

export interface IKeywordService {
  getKeywordLists: (
    organisationId: string,
  ) => Promise<DataListResponse<KeywordListResource>>;
  getKeywordList: (
    keywordListId: string,
  ) => Promise<DataResponse<KeywordListResource>>;
  updateKeywordList: (
    keywordListId: string,
    body: Partial<KeywordListResource>,
  ) => Promise<DataResponse<KeywordListResource>>;
  getKeywordListExpressions: (
    keywordListId: string,
  ) => Promise<DataListResponse<KeywordResource>>;
  createKeywordListExpression: (
    keywordListId: string,
    body: Partial<KeywordResource>,
  ) => Promise<DataResponse<KeywordResource>>;
  deleteKeywordListExpression: (
    keywordListId: string,
    keywordExpressionId: string,
    body?: Partial<KeywordResource>,
  ) => Promise<DataResponse<KeywordResource>>;
  createKeywordList: (
    keywordListId: string,
    body: Partial<KeywordListResource>,
  ) => Promise<DataResponse<KeywordListResource>>;
  deleteKeywordLists: (
    keywordListId: string,
    options: object,
  ) => Promise<DataResponse<KeywordListResource>>;
}

@injectable()
export class KeywordListService implements IKeywordService {
  getKeywordLists(
    organisationId: string,
    options: object = {},
  ): Promise<DataListResponse<KeywordListResource>> {
    const endpoint = 'keyword_lists';

    const params = {
      organisation_id: organisationId,
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  }

  getKeywordList(
    keywordListId: string,
  ): Promise<DataResponse<KeywordListResource>> {
    const endpoint = `keyword_lists/${keywordListId}`;
    return ApiService.getRequest(endpoint);
  }

  updateKeywordList(
    keywordListId: string,
    body: Partial<KeywordListResource>,
  ): Promise<DataResponse<KeywordListResource>> {
    const endpoint = `keyword_lists/${keywordListId}`;
    return ApiService.putRequest(endpoint, body);
  }

  getKeywordListExpressions(
    keywordListId: string,
  ): Promise<DataListResponse<KeywordResource>> {
    const endpoint = `keyword_lists/${keywordListId}/keyword_expressions`;
    return ApiService.getRequest(endpoint);
  }

  createKeywordListExpression(
    keywordListId: string,
    body: Partial<KeywordResource>,
  ): Promise<DataResponse<KeywordResource>> {
    const endpoint = `keyword_lists/${keywordListId}/keyword_expressions`;
    return ApiService.postRequest(endpoint, body);
  }

  deleteKeywordListExpression(
    keywordListId: string,
    keywordExpressionId: string,
    body?: Partial<KeywordResource>,
  ): Promise<DataResponse<KeywordResource>> {
    const endpoint = `keyword_lists/${keywordListId}/keyword_expressions/${keywordExpressionId}`;
    return ApiService.deleteRequest(endpoint, body);
  }

  createKeywordList(
    organisationId: string,
    body: Partial<KeywordListResource>,
  ): Promise<DataResponse<KeywordListResource>> {
    const endpoint = `keyword_lists?organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, body);
  }

  deleteKeywordLists(
    id: string,
    options: object = {},
  ): Promise<DataResponse<any>> {
    const endpoint = `keyword_lists/${id}`;
    return ApiService.deleteRequest(endpoint, options);
  }
}

const KeywordService = new KeywordListService();

export default KeywordService;
