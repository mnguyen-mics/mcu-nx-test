import { KeywordListSelectionResource } from './../../models/keywordList/keywordList';
import ApiService, { DataResponse, DataListResponse } from '../ApiService';
import { KeywordListResource } from '../../models/keywordList/keywordList';

const KeywordService = {
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
  },
  getKeywordList(
    keywordListId: string,
  ): Promise<DataResponse<KeywordListResource>> {
    const endpoint = `keyword_lists/${keywordListId}`;
    return ApiService.getRequest(endpoint);
  },
  saveKeywordList(
    keywordListId: string,
    body: Partial<KeywordListResource>
  ): Promise<DataResponse<KeywordListResource>> {
    const endpoint = `keyword_lists/${keywordListId}`;
    return ApiService.putRequest(endpoint, body);
  },
  getKeywordListExpressions(
    keywordListId: string,
  ): Promise<DataListResponse<KeywordListSelectionResource>> {
    const endpoint = `keyword_lists/${keywordListId}/keyword_expressions`;
    return ApiService.getRequest(endpoint);
  },
  saveKeywordListExpression(
    keywordListId: string,
    body: Partial<KeywordListSelectionResource>
  ): Promise<DataResponse<KeywordListSelectionResource>> {
    const endpoint = `keyword_lists/${keywordListId}/keyword_expressions`;
    return ApiService.postRequest(endpoint, body);
  },
  createKeywordList(
    organisationId: string,
    body: Partial<KeywordListResource>
  ): Promise<DataResponse<KeywordListResource>> {
    const endpoint = `keyword_lists?organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, body);
  },
  deleteKeywordLists(
    id: string,
    options: object = {},
  ): Promise<DataResponse<any>> {
    const endpoint = `keyword_lists/${id}`;
    return ApiService.deleteRequest(endpoint, options);
  },
};

export default KeywordService;
