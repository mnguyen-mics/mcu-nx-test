import ApiService, { DataListResponse, DataResponse } from '../ApiService';
import { DealsListResource } from '../../models/dealList/dealList';

const DealListService = {
  getDealLists(
    organisationId: string,
    options: object = {},
  ): Promise<DataListResponse<DealsListResource>> {
    const endpoint = 'deal_lists';

    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  },
  getDealList(
    dealListId: string,
  ): Promise<DataResponse<DealsListResource>> {
    const endpoint = `deal_lists/${dealListId}`;

    return ApiService.getRequest(endpoint);
  },
  deleteDealList(
    dealListId: string,
  ): Promise<DataResponse<any>> {
    const endpoint = `deal_lists/${dealListId}`;
    return ApiService.deleteRequest(endpoint);
  },
};

export default DealListService;
