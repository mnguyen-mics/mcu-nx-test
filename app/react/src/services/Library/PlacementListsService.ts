import { PlacementList } from './../../models/placementList/PlacementList';
import { PlacementDescriptorResource } from './../../models/placement/PlacementDescriptorResource';
import ApiService, { DataListResponse, DataResponse } from '../ApiService';

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
  updatePlacementList(
    placementListId: string,
    body: Partial<PlacementList>,
  ): Promise<DataResponse<PlacementList>> {
    const endpoint = `placement_lists/${placementListId}`;
    return ApiService.putRequest(endpoint, body);
  },
  createPlacementList(
    organisationId: string,
    body: Partial<PlacementList>,
  ): Promise<DataResponse<PlacementList>> {
    const endpoint = `placement_lists?organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, body);
  },
  getPlacementDescriptors(
    placementListId: string,
  ): Promise<DataListResponse<PlacementDescriptorResource>> {
    const endpoint = `placement_lists/${placementListId}/placement_descriptors`;
    return ApiService.getRequest(endpoint);
  },
  updatePlacementDescriptor(
    placementListId: string,
    placementDescriptorId: string,
    body: Partial<PlacementDescriptorResource>,
  ): Promise<DataResponse<PlacementDescriptorResource>> {
    const endpoint = `placement_lists/${placementListId}/placement_descriptors/${placementDescriptorId}`;
    return ApiService.putRequest(endpoint, body);
  },
  createPlacementDescriptor(
    placementListId: string,
    body: Partial<PlacementDescriptorResource>,
  ): Promise<DataResponse<PlacementDescriptorResource>> {
    const endpoint = `placement_lists/${placementListId}/placement_descriptors`;
    return ApiService.postRequest(endpoint, body);
  },
  deletePlacementDescriptor(
    placementListId: string,
    placementDescriptorId: string,
  ): Promise<DataResponse<any>> {
    const endpoint = `placement_lists/${placementListId}/placement_descriptors/${placementDescriptorId}`;
    return ApiService.deleteRequest(endpoint);
  },
  deletePlacementList(placementListId: string): Promise<DataResponse<any>> {
    const endpoint = `placement_lists/${placementListId}`;
    return ApiService.deleteRequest(endpoint);
  },
};

export default PlacementListService;
