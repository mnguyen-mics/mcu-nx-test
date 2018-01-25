import ApiService, { DataListResponse, DataResponse } from '../ApiService';
import { PlacementList } from '../../models/placementList/PlacementList';

const PlacementListService = {
  getPlacementLists(
    organisationId: string,
    options: object = {},
  ): Promise<DataListResponse<PlacementList>> {
    const endpoint = 'placement_lists';

    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  },
  getPlacementList(
    placementListId: string,
  ): Promise<DataResponse<PlacementList>> {
    const endpoint = `placement_lists/${placementListId}`;

    return ApiService.getRequest(endpoint);
  },
  deletePlacementList(
    placementListId: string,
  ): Promise<DataResponse<any>> {
    const endpoint = `placement_lists/${placementListId}`;
    return ApiService.deleteRequest(endpoint);
  },
};

export default PlacementListService;
