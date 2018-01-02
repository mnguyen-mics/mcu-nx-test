import ApiService, { DataListResponse, DataResponse } from '../ApiService';
import { PlacementList } from '../../models/placementList/placementList';

const placementListService = {
  getPlacementLists(organisationId: string, options: object = {}): Promise<DataListResponse<PlacementList>> {
    const endpoint = 'placement_lists';

    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  },
  getPlacementList(placementListId: string, options: object = {}): Promise<DataResponse<PlacementList>> {
    const endpoint = `placement_lists/${placementListId}`;

    const params = {
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  },
  deletePlacementList(id: string, options: object = {}): Promise<DataResponse<any>> {
    const endpoint = `placement_lists/${id}`;
    return ApiService.deleteRequest(endpoint, options);
  },
};

export default placementListService;
