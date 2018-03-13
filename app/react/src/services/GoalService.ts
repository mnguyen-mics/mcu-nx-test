import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { PaginatedApiParam } from '../utils/ApiHelper';
import {
  GoalResource,
  GoalCreateRequest,
  AttributionSelectionResource,
  AttributionModelResource,
} from '../models/goal';
import { UserQueryGoalResource } from '../models/goal/GoalResource';

export interface GetGoalsOption extends PaginatedApiParam {
  keywords?: string[];
  archived?: boolean;
  order_by?: string[];
  label_ids?: string[];
}

const GoalService = {
  getGoals(
    organisationId: string,
    options: GetGoalsOption = {},
  ): Promise<DataListResponse<GoalResource>> {
    const endpoint = 'goals';
    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  },

  getGoal(goaldId: string): Promise<DataResponse<GoalResource>> {
    const endpoint = `goals/${goaldId}`;

    return ApiService.getRequest(endpoint);
  },

  updateGoal(
    goaldId: string,
    resource: Partial<UserQueryGoalResource>,
  ): Promise<DataResponse<GoalResource>> {
    const endpoint = `goals/${goaldId}`;

    return ApiService.putRequest(endpoint, resource);
  },

  createGoal(
    organisationId: string,
    resource: Partial<GoalCreateRequest>,
  ): Promise<DataResponse<GoalResource>> {
    const endpoint = `goals?organisation_id=${organisationId}`;

    return ApiService.postRequest(endpoint, resource);
  },

  linkAttributionModelToGoal(
    goalId: string,
    resource: AttributionModelResource,
  ): Promise<DataResponse<AttributionSelectionResource>> {
    const endpoint = `goals/${goalId}/attribution_models`;

    return ApiService.postRequest(endpoint, resource);
  },

  getAttributionModels(
    goalId: string,
  ): Promise<DataListResponse<AttributionSelectionResource>> {
    const endpoint = `goals/${goalId}/attribution_models`;
    return ApiService.getRequest(endpoint);
  },

  deleteAttributionModel(
    goalId: string,
    attributionModelId: string,
    // body: Partial<AttributionSelectionResource>
  ): Promise<DataResponse<AttributionModelResource>> {
    const endpoint = `goals/${goalId}/attribution_models/${attributionModelId}`;
    return ApiService.deleteRequest(endpoint);
  },
};

export default GoalService;
