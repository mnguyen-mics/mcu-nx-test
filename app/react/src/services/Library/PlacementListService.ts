import { PlacementList } from '../../models/placementList/PlacementList';
import { PlacementDescriptorResource } from '../../models/placement/PlacementDescriptorResource';
import ApiService, { DataListResponse, DataResponse } from '../ApiService';

export interface IPlacementListService {
  getPlacementLists: (
    organisationId: string,
    options?: object,
  ) => Promise<DataListResponse<PlacementList>>;
  getPlacementList: (
    placementListId: string,
  ) => Promise<DataResponse<PlacementList>>;
  updatePlacementList: (
    placementListId: string,
    body: Partial<PlacementList>,
  ) => Promise<DataResponse<PlacementList>>;
  createPlacementList: (
    organisationId: string,
    body: Partial<PlacementList>,
  ) => Promise<DataResponse<PlacementList>>;
  getPlacementDescriptors: (
    placementListId: string,
    options?: object,
  ) => Promise<DataListResponse<PlacementDescriptorResource>>;
  updatePlacementDescriptor: (
    placementListId: string,
    placementDescriptorId: string,
    body: Partial<PlacementDescriptorResource>,
  ) => Promise<DataResponse<PlacementDescriptorResource>>;
  updatePlacementDescriptorBatch: (
    placementListId: string,
    body: FormData,
  ) => Promise<any>;
  createPlacementDescriptor: (
    placementListId: string,
    body: Partial<PlacementDescriptorResource>,
  ) => Promise<DataResponse<PlacementDescriptorResource>>;
  deletePlacementDescriptor: (
    placementListId: string,
    placementDescriptorId: string,
  ) => Promise<DataResponse<any>>;
  deletePlacementList: (placementListId: string) => Promise<DataResponse<any>>;
}

export class PlacementListService implements IPlacementListService {
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
  }
  getPlacementList(
    placementListId: string,
  ): Promise<DataResponse<PlacementList>> {
    const endpoint = `placement_lists/${placementListId}`;

    return ApiService.getRequest(endpoint);
  }
  updatePlacementList(
    placementListId: string,
    body: Partial<PlacementList>,
  ): Promise<DataResponse<PlacementList>> {
    const endpoint = `placement_lists/${placementListId}`;
    return ApiService.putRequest(endpoint, body);
  }
  createPlacementList(
    organisationId: string,
    body: Partial<PlacementList>,
  ): Promise<DataResponse<PlacementList>> {
    const endpoint = `placement_lists?organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, body);
  }
  getPlacementDescriptors(
    placementListId: string,
    options: object = {},
  ): Promise<DataListResponse<PlacementDescriptorResource>> {
    const endpoint = `placement_lists/${placementListId}/placement_descriptors`;

    const params = {
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  }
  updatePlacementDescriptor(
    placementListId: string,
    placementDescriptorId: string,
    body: Partial<PlacementDescriptorResource>,
  ): Promise<DataResponse<PlacementDescriptorResource>> {
    const endpoint = `placement_lists/${placementListId}/placement_descriptors/${placementDescriptorId}`;
    return ApiService.putRequest(endpoint, body);
  }
  updatePlacementDescriptorBatch(
    placementListId: string,
    body: FormData,
  ): Promise<any> {
    const endpoint = `placement_lists/${placementListId}/placement_descriptors/batch`;
    return ApiService.postRequest(endpoint, body);
  }
  createPlacementDescriptor(
    placementListId: string,
    body: Partial<PlacementDescriptorResource>,
  ): Promise<DataResponse<PlacementDescriptorResource>> {
    const endpoint = `placement_lists/${placementListId}/placement_descriptors`;
    return ApiService.postRequest(endpoint, body);
  }
  deletePlacementDescriptor(
    placementListId: string,
    placementDescriptorId: string,
  ): Promise<DataResponse<any>> {
    const endpoint = `placement_lists/${placementListId}/placement_descriptors/${placementDescriptorId}`;
    return ApiService.deleteRequest(endpoint);
  }
  deletePlacementList(placementListId: string): Promise<DataResponse<any>> {
    const endpoint = `placement_lists/${placementListId}`;
    return ApiService.deleteRequest(endpoint);
  }
}
