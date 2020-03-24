import { injectable } from 'inversify';
import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { ScenarioExitConditionResource, ScenarioExitConditionCreateResource } from '../models/automations/automations';

export interface IScenarioExitConditionService {
  getScenarioExitConditions: (
    scenarioId: string,
  ) => Promise<DataListResponse<ScenarioExitConditionResource>>;

  getScenarioExitCondition: (
    scenarioId: string,
    exitConditionId: string,
  ) => Promise<DataResponse<ScenarioExitConditionResource>>;

  createScenarioExitConditions: (
    scenarioId: string,
    exitCondition: ScenarioExitConditionCreateResource,
  ) => Promise<DataResponse<ScenarioExitConditionResource>>;

  deleteScenarioExitConditions: (
    scenarioId: string,
    exitConditionId: string,
  ) => Promise<void>;
}

@injectable()
export class ScenarioExitConditionService
  implements IScenarioExitConditionService {
  getScenarioExitConditions(
    scenarioId: string,
  ): Promise<DataListResponse<ScenarioExitConditionResource>> {
    const endpoint = `scenarios/${scenarioId}/exit_conditions`;
    return ApiService.getRequest(endpoint);
  }

  getScenarioExitCondition(
    scenarioId: string,
    exitConditionId: string,
  ): Promise<DataResponse<ScenarioExitConditionResource>> {
    const endpoint = `scenarios/${scenarioId}/exit_conditions/${exitConditionId}`;
    return ApiService.getRequest(endpoint);
  }

  createScenarioExitConditions(
    scenarioId: string,
    exitCondition: ScenarioExitConditionCreateResource,
  ): Promise<DataResponse<ScenarioExitConditionResource>> {
    const endpoint = `scenarios/${scenarioId}/exit_conditions`;
    return ApiService.postRequest(endpoint, exitCondition);
  }

  deleteScenarioExitConditions(
    scenarioId: string,
    exitConditionId: string,
  ): Promise<void> {
    const endpoint = `scenarios/${scenarioId}/exit_conditions/${exitConditionId}`;
    return ApiService.deleteRequest(endpoint);
  }
}
