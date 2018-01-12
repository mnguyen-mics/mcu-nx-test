import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { GoalResource, AttributionSelectionResource } from '../models/goal'

const goalService = {
  getGoals(organisationId: string, options: object = {}): Promise<DataListResponse<GoalResource>> {
    const endpoint = 'goals';
  
    const params = {
      organisation_id: organisationId,
      ...options,
    };
  
    return ApiService.getRequest(endpoint, params);
  },
  getGoal(goaldId: string, options: object = {}): Promise<DataResponse<GoalResource>> {
    const endpoint = `goals/${goaldId}`;
  
    return ApiService.getRequest(endpoint, options);
  },
  updateGoal(id: string, body: object): Promise<DataResponse<GoalResource>> {
    const endpoint = `goals/${id}`;
    return ApiService.putRequest(endpoint, body);
  },
  updateGoalDeprecated(campaignId: string, id: string, orgId: string, body: object = {}) {
    const endpoint = `goals/${id}`;
    return ApiService.putRequest(endpoint, body);
  },
  createGoal(organisationId: string, options: object = {}): Promise<DataResponse<GoalResource>> {
    const endpoint = `goals?organisation_id=${organisationId}`;
  
    return ApiService.postRequest(endpoint, options);
  },
  createAttributionModel(goalId: string, options: object = {}): Promise<DataResponse<AttributionSelectionResource>> {
    const endpoint = `goals/${goalId}/attribution_models`;
  
    return ApiService.postRequest(endpoint, options);
  },
  getAttributionModel(goalId: string, options: object = {}): Promise<DataListResponse<AttributionSelectionResource>> {
    const endpoint = `goals/${goalId}/attribution_models`;
    return ApiService.getRequest(endpoint, options);
  }
}

export default goalService;
