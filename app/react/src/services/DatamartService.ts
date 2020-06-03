import {
  ExtendedCleaningRuleResource,
  UserEventContentFilterResource,
  CleaningRuleType,
} from './../models/cleaningRules/CleaningRules';
import { ProcessingSelectionResource } from './../models/processing';
import ApiService, { DataListResponse, DataResponse } from './ApiService';
import {
  DatamartResource,
  UserAccountCompartmentDatamartSelectionResource,
  UserAccountCompartmentResource,
} from '../models/datamart/DatamartResource';
import { EventRules } from '../models/settings/settings';
import { injectable } from 'inversify';

export interface IDatamartService {
  getDatamarts: (
    organisationId: string,
    options?: object,
  ) => Promise<DataListResponse<DatamartResource>>;

  getDatamart: (datamartId: string) => Promise<DataResponse<DatamartResource>>;

  updateDatamart: (
    datamartId: string,
    datamart: Partial<DatamartResource>,
  ) => Promise<DataResponse<DatamartResource>>;

  createDatamart: (
    organisationId: string,
    datamart: Partial<DatamartResource>,
  ) => Promise<DataResponse<DatamartResource>>;

  getEventRules: (
    datamartId: string,
    organisationId: string,
  ) => Promise<DataListResponse<EventRules>>;

  createEventRules: (
    datamartId: string,
    body: { organisation_id: string; properties: Partial<EventRules> },
  ) => Promise<DataResponse<EventRules>>;

  updateEventRules: (
    datamartId: string,
    eventRuleId: string,
    body: Partial<EventRules>,
  ) => Promise<DataResponse<EventRules>>;

  deleteEventRules: (
    datamartId: string,
    eventRuleId: string,
  ) => Promise<DataResponse<EventRules>>;

  getUserAccountCompartmentDatamartSelectionResources: (
    datamartId: string,
    options?: object,
  ) => Promise<
    DataListResponse<UserAccountCompartmentDatamartSelectionResource>
  >;

  getUserAccountCompartmentDatamartSelectionResource: (
    datamartId: string,
    compartmentId: string,
  ) => Promise<DataResponse<UserAccountCompartmentDatamartSelectionResource>>;

  createUserAccountCompartmentDatamartSelectionResource: (
    datamartId: string,
    compartment: Partial<UserAccountCompartmentDatamartSelectionResource>,
  ) => Promise<DataResponse<UserAccountCompartmentDatamartSelectionResource>>;

  updateUserAccountCompartmentDatamartSelectionResource: (
    datamartId: string,
    compartmentId: string,
    compartment: Partial<UserAccountCompartmentDatamartSelectionResource>,
  ) => Promise<DataResponse<UserAccountCompartmentDatamartSelectionResource>>;

  getUserAccountCompartment: (
    compartmentId: string,
  ) => Promise<DataResponse<UserAccountCompartmentResource>>;

  createUserAccountCompartment: (
    compartment: Partial<UserAccountCompartmentResource>,
  ) => Promise<DataResponse<UserAccountCompartmentResource>>;

  updateUserAccountCompartment: (
    compartmentId: string,
    compartment: Partial<UserAccountCompartmentResource>,
  ) => Promise<DataResponse<UserAccountCompartmentResource>>;

  getSources: (
    datamartId: string,
  ) => Promise<DataListResponse<DatamartResource>>;

  getCleaningRules: (
    datamartId: string,
    options?: object,
  ) => Promise<DataListResponse<ExtendedCleaningRuleResource>>;

  createCleaningRule: (
    datamartId: string,
    cleaningRuleResource: Partial<ExtendedCleaningRuleResource>,
  ) => Promise<DataResponse<ExtendedCleaningRuleResource>>;

  getCleaningRule: (
    datamartId: string,
    cleaningRuleId: string,
    type?: CleaningRuleType,
  ) => Promise<DataResponse<ExtendedCleaningRuleResource>>;

  updateCleaningRule: (
    datamartId: string,
    cleaningRuleId: string,
    cleaningRuleResource: Partial<ExtendedCleaningRuleResource>,
  ) => Promise<DataResponse<ExtendedCleaningRuleResource>>;

  deleteCleaningRule: (
    datamartId: string,
    cleaningRuleId: string,
    type?: CleaningRuleType,
  ) => Promise<DataResponse<{}>>;

  getContentFilter: (
    datamartId: string,
    ruleId: string,
  ) => Promise<DataResponse<UserEventContentFilterResource>>;

  createContentFilter: (
    datamartId: string,
    ruleId: string,
    resource: Partial<UserEventContentFilterResource>,
  ) => Promise<DataResponse<UserEventContentFilterResource>>;

  updateContentFilter: (
    datamartId: string,
    ruleId: string,
    resource: Partial<UserEventContentFilterResource>,
  ) => Promise<DataResponse<UserEventContentFilterResource>>;

  deleteContentFilter: (
    datamartId: string,
    ruleId: string,
  ) => Promise<DataResponse<{}>>;

  getProcessingSelectionsByCompartment: (
    datamartId: string,
    compartmentId: string,
  ) => Promise<DataListResponse<ProcessingSelectionResource>>;

  createProcessingSelectionForCompartment: (
    datamartId: string,
    compartmentId: string,
    body: Partial<ProcessingSelectionResource>,
  ) => Promise<DataResponse<ProcessingSelectionResource>>;

  getCompartmentProcessingSelection: (
    datamartId: string,
    compartmentId: string,
    processingSelectionId: string,
  ) => Promise<DataResponse<ProcessingSelectionResource>>;

  deleteCompartmentProcessingSelection: (
    datamartId: string,
    compartmentId: string,
    processingSelectionId: string,
  ) => Promise<DataResponse<ProcessingSelectionResource>>;
}

@injectable()
export class DatamartService implements IDatamartService {
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
  }

  getDatamart(datamartId: string): Promise<DataResponse<DatamartResource>> {
    const endpoint = `datamarts/${datamartId}`;
    return ApiService.getRequest(endpoint);
  }

  updateDatamart(
    datamartId: string,
    datamart: Partial<DatamartResource>,
  ): Promise<DataResponse<DatamartResource>> {
    const endpoint = `datamarts/${datamartId}`;
    return ApiService.putRequest(endpoint, datamart);
  }

  createDatamart(
    organisationId: string,
    datamart: Partial<DatamartResource>,
  ): Promise<DataResponse<DatamartResource>> {
    const endpoint = `datamarts?organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, datamart);
  }

  getEventRules(
    datamartId: string,
    organisationId: string,
  ): Promise<DataListResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/event_rules`;
    return ApiService.getRequest(endpoint, { organisation_id: organisationId });
  }

  createEventRules(
    datamartId: string,
    body: { organisation_id: string; properties: Partial<EventRules> },
  ): Promise<DataResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/event_rules`;
    return ApiService.postRequest(endpoint, body);
  }

  updateEventRules(
    datamartId: string,
    eventRuleId: string,
    body: Partial<EventRules>,
  ): Promise<DataResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/event_rules/${eventRuleId}`;
    return ApiService.putRequest(endpoint, body);
  }

  deleteEventRules(
    datamartId: string,
    eventRuleId: string,
  ): Promise<DataResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/event_rules/${eventRuleId}`;
    return ApiService.deleteRequest(endpoint);
  }

  getUserAccountCompartmentDatamartSelectionResources(
    datamartId: string,
    options: object = {},
  ): Promise<
    DataListResponse<UserAccountCompartmentDatamartSelectionResource>
  > {
    const endpoint = `datamarts/${datamartId}/compartments`;
    return ApiService.getRequest(endpoint, options);
  }

  getUserAccountCompartmentDatamartSelectionResource(
    datamartId: string,
    compartmentId: string,
  ): Promise<DataResponse<UserAccountCompartmentDatamartSelectionResource>> {
    const endpoint = `datamarts/${datamartId}/compartments/${compartmentId}`;
    return ApiService.getRequest(endpoint);
  }

  createUserAccountCompartmentDatamartSelectionResource(
    datamartId: string,
    compartment: Partial<UserAccountCompartmentDatamartSelectionResource>,
  ): Promise<DataResponse<UserAccountCompartmentDatamartSelectionResource>> {
    const endpoint = `datamarts/${datamartId}/compartments`;
    return ApiService.postRequest(endpoint, compartment);
  }

  updateUserAccountCompartmentDatamartSelectionResource(
    datamartId: string,
    compartmentId: string,
    compartment: Partial<UserAccountCompartmentDatamartSelectionResource>,
  ): Promise<DataResponse<UserAccountCompartmentDatamartSelectionResource>> {
    const endpoint = `datamarts/${datamartId}/compartments/${compartmentId}`;
    return ApiService.putRequest(endpoint, compartment);
  }

  getUserAccountCompartment(
    compartmentId: string,
  ): Promise<DataResponse<UserAccountCompartmentResource>> {
    const endpoint = `user_account_compartments/${compartmentId}`;
    return ApiService.getRequest(endpoint);
  }
  createUserAccountCompartment(
    compartment: Partial<UserAccountCompartmentResource>,
  ): Promise<DataResponse<UserAccountCompartmentResource>> {
    const endpoint = 'user_account_compartments';
    return ApiService.postRequest(endpoint, compartment);
  }

  updateUserAccountCompartment(
    compartmentId: string,
    compartment: Partial<UserAccountCompartmentResource>,
  ): Promise<DataResponse<UserAccountCompartmentResource>> {
    const endpoint = `user_account_compartments/${compartmentId}`;
    return ApiService.putRequest(endpoint, compartment);
  }

  getSources(datamartId: string): Promise<DataListResponse<DatamartResource>> {
    const endpoint = `datamarts/${datamartId}/sources`;
    return ApiService.getRequest(endpoint);
  }

  getCleaningRules(
    datamartId: string,
    options: object = {},
  ): Promise<DataListResponse<ExtendedCleaningRuleResource>> {
    const endpoint = `datamarts/${datamartId}/cleaning_rules`;
    return ApiService.getRequest(endpoint, options);
  }

  createCleaningRule(
    datamartId: string,
    cleaningRuleResource: ExtendedCleaningRuleResource,
  ): Promise<DataResponse<ExtendedCleaningRuleResource>> {
    const endpoint = `datamarts/${datamartId}/cleaning_rules`;
    return ApiService.postRequest(endpoint, cleaningRuleResource);
  }

  getCleaningRule(
    datamartId: string,
    cleaningRuleId: string,
    type?: CleaningRuleType,
  ): Promise<DataResponse<ExtendedCleaningRuleResource>> {
    const endpoint = `datamarts/${datamartId}/cleaning_rules/${cleaningRuleId}`;
    return ApiService.getRequest(endpoint, { type });
  }

  updateCleaningRule(
    datamartId: string,
    cleaningRuleId: string,
    cleaningRuleResource: ExtendedCleaningRuleResource,
  ): Promise<DataResponse<ExtendedCleaningRuleResource>> {
    const endpoint = `datamarts/${datamartId}/cleaning_rules/${cleaningRuleId}`;
    return ApiService.putRequest(endpoint, cleaningRuleResource);
  }

  deleteCleaningRule(
    datamartId: string,
    cleaningRuleId: string,
    type?: CleaningRuleType,
  ): Promise<DataResponse<{}>> {
    const endpoint = `datamarts/${datamartId}/cleaning_rules/${cleaningRuleId}`;
    return ApiService.deleteRequest(endpoint, { type });
  }

  getContentFilter(
    datamartId: string,
    ruleId: string,
  ): Promise<DataResponse<UserEventContentFilterResource>> {
    const endpoint = `datamarts/${datamartId}/cleaning_rules/${ruleId}/content_filter`;
    return ApiService.getRequest(endpoint);
  }

  createContentFilter(
    datamartId: string,
    ruleId: string,
    resource: Partial<UserEventContentFilterResource>,
  ): Promise<DataResponse<UserEventContentFilterResource>> {
    const endpoint = `datamarts/${datamartId}/cleaning_rules/${ruleId}/content_filter`;
    return ApiService.postRequest(endpoint, resource);
  }

  updateContentFilter(
    datamartId: string,
    ruleId: string,
    resource: Partial<UserEventContentFilterResource>,
  ): Promise<DataResponse<UserEventContentFilterResource>> {
    const endpoint = `datamarts/${datamartId}/cleaning_rules/${ruleId}/content_filter`;
    return ApiService.putRequest(endpoint, resource);
  }

  deleteContentFilter(
    datamartId: string,
    ruleId: string,
  ): Promise<DataResponse<{}>> {
    const endpoint = `datamarts/${datamartId}/cleaning_rules/${ruleId}/content_filter`;
    return ApiService.deleteRequest(endpoint);
  }

  getProcessingSelectionsByCompartment(
    datamartId: string,
    compartmentId: string,
  ): Promise<DataListResponse<ProcessingSelectionResource>> {
    const endpoint = `datamarts/${datamartId}/compartments/${compartmentId}/processing_selections`;
    return ApiService.getRequest(endpoint);
  }

  createProcessingSelectionForCompartment(
    datamartId: string,
    compartmentId: string,
    body: Partial<ProcessingSelectionResource>,
  ): Promise<DataResponse<ProcessingSelectionResource>> {
    const endpoint = `datamarts/${datamartId}/compartments/${compartmentId}/processing_selections`;
    return ApiService.postRequest(endpoint, body);
  }

  getCompartmentProcessingSelection(
    datamartId: string,
    compartmentId: string,
    processingSelectionId: string,
  ): Promise<DataResponse<ProcessingSelectionResource>> {
    const endpoint = `datamarts/${datamartId}/compartments/${compartmentId}/processing_selections/${processingSelectionId}`;
    return ApiService.getRequest(endpoint);
  }

  deleteCompartmentProcessingSelection(
    datamartId: string,
    compartmentId: string,
    processingSelectionId: string,
  ): Promise<DataResponse<ProcessingSelectionResource>> {
    const endpoint = `datamarts/${datamartId}/compartments/${compartmentId}/processing_selections/${processingSelectionId}`;
    return ApiService.deleteRequest(endpoint);
  }
}
