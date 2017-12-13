import ApiService, { DataResponse, DataListResponse } from '../ApiService';
import { Keyword } from '../../models/keywordList/keywordList';

const KeywordService = {
  getKeywordLists(organisationId: string, options: object = {}): Promise<DataListResponse<Keyword>> {
    const endpoint = 'keyword_lists';

    const params = {
      organisation_id: organisationId,
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  },
  deleteKeywordLists(id: string, options: object = {}): Promise<DataResponse<any>> {
    const endpoint = `keyword_lists/${id}`;
    return ApiService.deleteRequest(endpoint, options);
  },
};

export default KeywordService;
