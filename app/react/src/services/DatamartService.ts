import ApiService, { DataListResponse, DataResponse } from './ApiService';
import {
  DatamartResource,
  UserAccountCompartmentDatamartSelectionResource,
  UserAccountCompartmentResource,
} from '../models/datamart/DatamartResource';
import { EventRules } from '../models/settings/settings';
import { UserEventCleaningRuleResource } from '../models/cleaningRules/CleaningRules';

const DatamartService = {
  getDatamarts(
    organisationId: string,
    options: object = {},
  ): Promise<DataListResponse<DatamartResource>> {
    const endpoint = 'datamarts';

    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  },
  getDatamart(datamartId: string): Promise<DataResponse<DatamartResource>> {
    const endpoint = `datamarts/${datamartId}`;
    return ApiService.getRequest(endpoint);
  },
  updateDatamart(
    datamartId: string,
    datamart: Partial<DatamartResource>,
  ): Promise<DataResponse<DatamartResource>> {
    const endpoint = `datamarts/${datamartId}`;
    return ApiService.putRequest(endpoint, datamart);
  },
  createDatamart(
    organisationId: string,
    datamart: Partial<DatamartResource>,
  ): Promise<DataResponse<DatamartResource>> {
    const endpoint = `datamarts?organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, datamart);
  },
  getEventRules(
    datamartId: string,
    organisationId: string,
  ): Promise<DataListResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/event_rules`;
    return ApiService.getRequest(endpoint, { organisation_id: organisationId });
  },
  createEventRules(
    datamartId: string,
    body: { organisation_id: string; properties: Partial<EventRules> },
  ): Promise<DataResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/event_rules`;
    return ApiService.postRequest(endpoint, body);
  },
  updateEventRules(
    datamartId: string,
    organisationId: string,
    eventRuleId: string,
    body: Partial<EventRules>,
  ): Promise<DataResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/event_rules/${eventRuleId}`;
    return ApiService.putRequest(endpoint, body);
  },
  deleteEventRules(
    datamartId: string,
    organisationId: string,
    eventRuleId: string,
  ): Promise<DataResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/event_rules/${eventRuleId}`;
    return ApiService.deleteRequest(endpoint);
  },
  getUserAccountCompartments(
    datamartId: string,
    options: object = {}
  ): Promise<
    DataListResponse<UserAccountCompartmentDatamartSelectionResource>
  > {
    const endpoint = `datamarts/${datamartId}/compartments`;
    return ApiService.getRequest(endpoint, options);
  },
  getUserAccountCompartment(
    compartmentId: string
  ): Promise<
    DataResponse<UserAccountCompartmentResource>
  > {
    const endpoint = `user_account_compartments/${compartmentId}`;
    return ApiService.getRequest(endpoint);
  },
  getSources(datamartId: string): Promise<DataListResponse<DatamartResource>> {
    const endpoint = `datamarts/${datamartId}/sources`;
    return ApiService.getRequest(endpoint);
  },
  getCleaningRules(
    datamartId: string,
    options: object = {},
  ): Promise<DataListResponse<UserEventCleaningRuleResource>> {
    const endpoint = `datamarts/${datamartId}/cleaning_rules`;

    const calculatedOptions = {
      type: 'USER_EVENT_CLEANING_RULE',
      ...options,
    };

    return ApiService.getRequest(endpoint, calculatedOptions);
  },
};

export default DatamartService;
