import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { AutomationResource, AutomationCreateResource, AutomationStatus } from '../models/automations/automations';
import { PaginatedApiParam } from '../utils/ApiHelper';

export interface GetAutomationsOptions extends PaginatedApiParam {
  administration_id?: string;
  scope?: string;
  keywords?: string;
  status?: AutomationStatus[];
  archived?: boolean;
  label_ids?: string[];
  order_by?: string[];
}

const scenariosService = {
  getScenarios(organisationId: string, options: object = {}): Promise<DataListResponse<AutomationResource>> {
    const endpoint = 'scenarios';
    const params = {
      organisation_id: organisationId,
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  },
  getScenario(scenarioId: string, options: object = {}): Promise<DataResponse<AutomationResource>> {
    const endpoint = `scenarios/${scenarioId}`;
    return ApiService.getRequest(endpoint, options);
  },
  createScenario(organisationId: string, scenario: AutomationCreateResource): Promise<DataResponse<AutomationResource>> {
    const endpoint = `scenarios?organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, scenario);
  },
  updateScenario(scenarioId: string, scenario: AutomationResource): Promise<DataResponse<AutomationResource>> {
    const endpoint = `scenarios/${scenarioId}`;
    return ApiService.putRequest(endpoint, scenario);
  }
}

export default scenariosService;
