import lodash from 'lodash';
import {
  ResourceHistoryResource,
  ResourceType,
  EventType,
  isHistoryLinkEvent,
} from '../models/resourceHistory/ResourceHistory';
import ApiService, { DataListResponse } from './ApiService';
import { injectable } from 'inversify';

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

export interface IResourceHistoryService {
  getHistory: (
    organisationId: string,
    options: GetGenericHistoryOptions,
  ) => Promise<DataListResponse<ResourceHistoryResource>>;

  getResourceHistory: (
    organisationId: string,
    options: GetResourceHistoryOptions,
  ) => Promise<DataListResponse<ResourceHistoryResource>>;

  getUserHistory: (
    organisationId: string,
    options: GetUserHistoryOptions,
  ) => Promise<DataListResponse<ResourceHistoryResource>>;

  getLinkedResourceIdInSelection: (
    organisationId: string,
    selectionType: ResourceType,
    selectionId: string,
    linkedResourceType: ResourceType,
  ) => Promise<string>;
}

@injectable()
export class ResourceHistoryService implements IResourceHistoryService {
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
  }

  getResourceHistory(
    organisationId: string,
    options: GetResourceHistoryOptions,
  ): Promise<DataListResponse<ResourceHistoryResource>> {
    return this.getHistory(organisationId, options);
  }

  getUserHistory(
    organisationId: string,
    options: GetUserHistoryOptions,
  ): Promise<DataListResponse<ResourceHistoryResource>> {
    return this.getHistory(organisationId, options);
  }

  getLinkedResourceIdInSelection(
    organisationId: string,
    selectionType: ResourceType,
    selectionId: string,
    linkedResourceType: ResourceType,
  ): Promise<string> {
    const params = {
      resource_type: selectionType,
      resource_id: selectionId,
      max_results: 15,
    }; // Let's keep 15 for now, selections shouldn't have many events anyway.

    return this.getResourceHistory(organisationId, params).then(response => {
      const ids = lodash
        .flatMap(response.data, rhr => {
          return rhr.events.map(event =>
            isHistoryLinkEvent(event) && event.resource_type === linkedResourceType
              ? event.resource_id
              : '',
          );
        })
        .filter(id => id !== '');
      return ids.length > 0 ? ids[0] : '';
    });
  }
}
