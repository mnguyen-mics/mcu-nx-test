import { injectable } from 'inversify';
import { ScenarioNodeShape } from './../models/automations/automations';
import ApiService, { DataListResponse, DataResponse } from './ApiService';
import {
  AutomationResource,
  AutomationCreateResource,
  AutomationStatus,
} from '../models/automations/automations';
import { PaginatedApiParam } from '../utils/ApiHelper';
import {
  PAGINATION_SEARCH_SETTINGS,
  FILTERS_SEARCH_SETTINGS,
  KEYWORD_SEARCH_SETTINGS,
} from '../utils/LocationSearchHelper';

export interface GetAutomationsOptions extends PaginatedApiParam {
  organisation_id?: string;
  keywords?: string;
  status?: AutomationStatus[];
  order_by?: string[];
  first_result?: number;
  max_results?: number;
}

export const SCENARIOS_SEARCH_SETTINGS = [
  ...PAGINATION_SEARCH_SETTINGS,
  ...FILTERS_SEARCH_SETTINGS,
  ...KEYWORD_SEARCH_SETTINGS,
];

export interface IScenarioService {
  getScenarios: (
    organisationId: string,
    options: object,
  ) => Promise<DataListResponse<AutomationResource>>;
  getScenario: (
    scenarioId: string,
    options?: object,
  ) => Promise<DataResponse<AutomationResource>>;
  createScenario: (
    organisationId: string,
    scenario: AutomationCreateResource,
  ) => Promise<DataResponse<AutomationResource>>;
  updateScenario: (
    scenarioId: string,
    scenario: AutomationResource,
  ) => Promise<DataResponse<AutomationResource>>;
  createScenarioNode: (
    scenarioId: string,
    scenarioNode: ScenarioNodeShape,
  ) => Promise<DataResponse<AutomationResource>>;
}

@injectable()
export class ScenarioService implements IScenarioService {
  getScenarios(
    organisationId: string,
    options: object = {},
  ): Promise<DataListResponse<AutomationResource>> {
    const endpoint = 'scenarios';
    const params = {
      organisation_id: organisationId,
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  }
  getScenario(
    scenarioId: string,
    options: object = {},
  ): Promise<DataResponse<AutomationResource>> {
    const endpoint = `scenarios/${scenarioId}`;
    return ApiService.getRequest(endpoint, options);
  }
  createScenario(
    organisationId: string,
    scenario: AutomationCreateResource,
  ): Promise<DataResponse<AutomationResource>> {
    const endpoint = `scenarios?organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, scenario);
  }
  updateScenario(
    scenarioId: string,
    scenario: AutomationResource,
  ): Promise<DataResponse<AutomationResource>> {
    const endpoint = `scenarios/${scenarioId}`;
    return ApiService.putRequest(endpoint, scenario);
  }
  createScenarioNode(
    scenarioId: string,
    scenarioNode: ScenarioNodeShape,
  ): Promise<DataResponse<AutomationResource>> {
    const endpoint = `scenarios/${scenarioId}/storyline/nodes`;
    return ApiService.postRequest(endpoint, scenarioNode);
  }
}

