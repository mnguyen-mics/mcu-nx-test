import { AttributionSelectionCreateRequest } from './../models/goal/AttributionSelectionResource';
import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { PaginatedApiParam } from '../utils/ApiHelper';
import { GoalResource, GoalCreateRequest, AttributionSelectionResource } from '../models/goal';
import { injectable } from 'inversify';

export interface GoalsOptions extends PaginatedApiParam {
  keywords?: string[];
  archived?: boolean;
  order_by?: string[];
  label_ids?: string[];
  datamart_id?: string;
}

export interface IGoalService {
  getGoals: (
    organisationId: string,
    options?: GoalsOptions,
  ) => Promise<DataListResponse<GoalResource>>;

  getGoal: (goaldId: string) => Promise<DataResponse<GoalResource>>;

  updateGoal: (
    goaldId: string,
    resource: Partial<GoalResource>,
  ) => Promise<DataResponse<GoalResource>>;
  createGoal: (
    organisationId: string,
    resource: Partial<GoalCreateRequest>,
  ) => Promise<DataResponse<GoalResource>>;
  deleteGoal: (goalId: string) => Promise<DataResponse<GoalResource>>;

  linkAttributionModelToGoal: (
    goalId: string,
    resource: Partial<AttributionSelectionCreateRequest>,
  ) => Promise<DataResponse<AttributionSelectionResource>>;

  updateLinkAttributionModel: (
    goalId: string,
    selectionId: string,
    resource: Partial<AttributionSelectionResource>,
  ) => Promise<DataResponse<AttributionSelectionResource>>;

  getAttributionModels: (goalId: string) => Promise<DataListResponse<AttributionSelectionResource>>;

  deleteAttributionModel: (
    goalId: string,
    attributionModelId: string,
  ) => Promise<DataResponse<AttributionSelectionResource>>;
}

@injectable()
export class GoalService implements IGoalService {
  getGoals(
    organisationId: string,
    options: GoalsOptions = {},
  ): Promise<DataListResponse<GoalResource>> {
    const endpoint = 'goals';
    const params = {
      organisation_id: organisationId,
      ...options,
    };
    if (options.datamart_id) {
      params.datamart_id = options.datamart_id;
    }
    return ApiService.getRequest(endpoint, params);
  }

  getGoal(goaldId: string): Promise<DataResponse<GoalResource>> {
    const endpoint = `goals/${goaldId}`;

    return ApiService.getRequest(endpoint);
  }

  updateGoal(
    goaldId: string,
    resource: Partial<GoalResource>,
  ): Promise<DataResponse<GoalResource>> {
    const endpoint = `goals/${goaldId}`;

    return ApiService.putRequest(endpoint, resource);
  }

  createGoal(
    organisationId: string,
    resource: Partial<GoalCreateRequest>,
  ): Promise<DataResponse<GoalResource>> {
    const endpoint = `goals?organisation_id=${organisationId}`;

    return ApiService.postRequest(endpoint, resource);
  }

  deleteGoal(goalId: string): Promise<DataResponse<GoalResource>> {
    const endpoint = `goals/${goalId}`;

    return ApiService.deleteRequest(endpoint);
  }

  linkAttributionModelToGoal(
    goalId: string,
    resource: Partial<AttributionSelectionCreateRequest>,
  ): Promise<DataResponse<AttributionSelectionResource>> {
    const endpoint = `goals/${goalId}/attribution_models`;

    return ApiService.postRequest(endpoint, resource);
  }

  updateLinkAttributionModel(
    goalId: string,
    selectionId: string,
    resource: Partial<AttributionSelectionResource>,
  ): Promise<DataResponse<AttributionSelectionResource>> {
    const endpoint = `goals/${goalId}/attribution_models/${selectionId}`;

    return ApiService.putRequest(endpoint, resource);
  }

  getAttributionModels(goalId: string): Promise<DataListResponse<AttributionSelectionResource>> {
    const endpoint = `goals/${goalId}/attribution_models`;
    return ApiService.getRequest(endpoint);
  }

  deleteAttributionModel(goalId: string, attributionModelId: string): Promise<any> {
    const endpoint = `goals/${goalId}/attribution_models/${attributionModelId}`;
    return ApiService.deleteRequest(endpoint);
  }
}
