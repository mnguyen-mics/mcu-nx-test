import { 
  ResourceHistoryResource,
  ResourceType,
  EventType,
} from "../models/resourceHistory/ResourceHistory";
import ApiService, { DataListResponse } from "./ApiService";

export interface GetGenericHistoryOptions {
  resource_type?: ResourceType;
  resource_id?: string;
  event_type?: EventType;
  user_id?: number;
  from?: string;
  to?: string;
  max_results?: number;
}

export interface GetResourceHistoryOptions extends GetGenericHistoryOptions {
  resource_type: ResourceType;
  resource_id: string;
}

export interface GetUserHistoryOptions extends GetGenericHistoryOptions {
  user_id: number;
}


const ResourceHistoryService = {
  getHistory(
    organisationId: string,
    options: GetGenericHistoryOptions,
  ): Promise<DataListResponse<ResourceHistoryResource>> {
    const endpoint = 'resource_history';

    const params = {
      organisation_id: organisationId,
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  },

  getResourceHistory(
    organisationId: string,
    options: GetResourceHistoryOptions,
  ): Promise<DataListResponse<ResourceHistoryResource>> {
    return ResourceHistoryService.getHistory(organisationId, options)
  },
  
  getUserHistory(
    organisationId: string,
    options: GetUserHistoryOptions,
  ): Promise<DataListResponse<ResourceHistoryResource>> {
    return ResourceHistoryService.getHistory(organisationId, options)
  }
}

export default ResourceHistoryService;
