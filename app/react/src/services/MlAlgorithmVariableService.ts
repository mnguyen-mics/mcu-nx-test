import { injectable } from 'inversify';
import MlAlgorithmVariableResource from '../models/mlAlgorithmVariable/MlAlgorithmVariableResource';
import ApiService, { DataListResponse, DataResponse } from './ApiService';

export interface IMlAlgorithmVariableService {
  getMlAlgorithmVariables: (
    organisationId: string,
    mlAlgorithmId: string,
    filters?: object,
  ) => Promise<DataListResponse<MlAlgorithmVariableResource>>;
  getMlAlgorithmVariable: (
    mlAlgorithmId: string,
    mlAlgorithmVariableId: string,
  ) => Promise<DataResponse<MlAlgorithmVariableResource>>;
  createMlAlgorithmVariable: (
    mlAlgorithmId: string,
    body: Partial<MlAlgorithmVariableResource>,
  ) => Promise<DataResponse<MlAlgorithmVariableResource>>;
  updateMlAlgorithmVariable: (
    mlAlgorithmId: string,
    mlAlgorithmVariableId: string,
    body: Partial<MlAlgorithmVariableResource>,
  ) => Promise<DataResponse<MlAlgorithmVariableResource>>;
  deleteMlAlgorithmVariable: (
    mlAlgorithmId: string,
    mlAlgorithmVariableId: string,
  ) => Promise<DataResponse<void>>;
}

@injectable()
export class MlAlgorithmVariableService implements IMlAlgorithmVariableService {
  getMlAlgorithmVariables(
    organisationId: string,
    mlAlgorithmId: string,
    filters?: object,
  ): Promise<DataListResponse<MlAlgorithmVariableResource>> {
    const endpoint = `ml_algorithms/${mlAlgorithmId}/variables`;
    const options = {
      organisation_id: organisationId,
      ...filters,
    };
    return ApiService.getRequest(endpoint, options);
  }
  getMlAlgorithmVariable(
    mlAlgorithmId: string,
    mlAlgorithmVariableId: string,
  ): Promise<DataResponse<MlAlgorithmVariableResource>> {
    const endpoint = `ml_algorithms/${mlAlgorithmId}/variables/${mlAlgorithmVariableId}`;
    return ApiService.getRequest(endpoint);
  }
  createMlAlgorithmVariable(
    mlAlgorithmId: string,
    body: Partial<MlAlgorithmVariableResource>,
  ): Promise<DataResponse<MlAlgorithmVariableResource>> {
    const endpoint = `ml_algorithms/${mlAlgorithmId}/variables`;
    return ApiService.postRequest(endpoint, body);
  }
  updateMlAlgorithmVariable(
    mlAlgorithmId: string,
    mlAlgorithmVariableId: string,
    body: Partial<MlAlgorithmVariableResource>,
  ): Promise<DataResponse<MlAlgorithmVariableResource>> {
    const endpoint = `ml_algorithms/${mlAlgorithmId}/variables/${mlAlgorithmVariableId}`;
    return ApiService.putRequest(endpoint, body);
  }
  deleteMlAlgorithmVariable(
    mlAlgorithmId: string,
    mlAlgorithmVariableId: string,
  ): Promise<DataResponse<void>> {
    const endpoint = `ml_algorithms/${mlAlgorithmId}/variables/${mlAlgorithmVariableId}`;
    return ApiService.deleteRequest(endpoint);
  }
}
