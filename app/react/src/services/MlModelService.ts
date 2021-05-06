import { injectable } from 'inversify';
import MlModelResource from '../models/mlModel/MlModelResource';
import ApiService, { DataListResponse, DataResponse } from './ApiService';

export interface IMlModelService {
  getMlModels: (
    organisationId: string,
    mlAlgorithmId: string,
    filters?: object,
  ) => Promise<DataListResponse<MlModelResource>>;
  getMlModel: (
    organisationId: string,
    mlAlgorithmId: string,
    mlModelId: string,
  ) => Promise<DataResponse<MlModelResource>>;
  createMlModel: (
    organisationId: string,
    mlAlgorithmId: string,
    body: Partial<MlModelResource>,
  ) => Promise<DataResponse<MlModelResource>>;
  updateMlModel: (
    organisationId: string,
    mlAlgorithmId: string,
    mlModelId: string,
    body: Partial<MlModelResource>,
  ) => Promise<DataResponse<MlModelResource>>;
  uploadResult: (
    organisationId: string,
    mlAlgorithmId: string,
    mlModelId: string,
    file: FormData,
  ) => Promise<DataResponse<MlModelResource>>;
  uploadModel: (
    organisationId: string,
    mlAlgorithmId: string,
    mlModelId: string,
    file: FormData,
  ) => Promise<DataResponse<MlModelResource>>;
  uploadNotebook: (
    organisationId: string,
    mlAlgorithmId: string,
    mlModelId: string,
    file: FormData,
  ) => Promise<DataResponse<MlModelResource>>;
}

@injectable()
export class MlModelService implements IMlModelService {
  getMlModels(
    organisationId: string,
    mlAlgorithmId: string,
    filters: object = {},
  ): Promise<DataListResponse<MlModelResource>> {
    const endpoint = `organisations/${organisationId}/ml_algorithms/${mlAlgorithmId}/ml_models`;
    const options = {
      organisation_id: organisationId,
      ...filters,
    };
    return ApiService.getRequest(endpoint, options);
  }
  getMlModel(
    organisationId: string,
    mlAlgorithmId: string,
    mlModelId: string,
  ): Promise<DataResponse<MlModelResource>> {
    const endpoint = `organisations/${organisationId}/ml_algorithms/${mlAlgorithmId}/ml_models/${mlModelId}`;
    return ApiService.getRequest(endpoint);
  }
  createMlModel(
    organisationId: string,
    mlAlgorithmId: string,
    body: Partial<MlModelResource>,
  ): Promise<DataResponse<MlModelResource>> {
    const endpoint = `organisations/${organisationId}/ml_algorithms/${mlAlgorithmId}/ml_models`;
    return ApiService.postRequest(endpoint, body);
  }
  updateMlModel(
    organisationId: string,
    mlAlgorithmId: string,
    mlModelId: string,
    body: Partial<MlModelResource>,
  ): Promise<DataResponse<MlModelResource>> {
    const endpoint = `organisations/${organisationId}/ml_algorithms/${mlAlgorithmId}/ml_models/${mlModelId}`;
    return ApiService.putRequest(endpoint, body);
  }
  uploadResult(
    organisationId: string,
    mlAlgorithmId: string,
    mlModelId: string,
    file: FormData,
  ): Promise<DataResponse<MlModelResource>> {
    const endpoint = `organisations/${organisationId}/ml_algorithms/${mlAlgorithmId}/ml_models/${mlModelId}/result`;
    return ApiService.postRequest(endpoint, file);
  }
  uploadModel(
    organisationId: string,
    mlAlgorithmId: string,
    mlModelId: string,
    file: FormData,
  ): Promise<DataResponse<MlModelResource>> {
    const endpoint = `organisations/${organisationId}/ml_algorithms/${mlAlgorithmId}/ml_models/${mlModelId}/model`;
    return ApiService.postRequest(endpoint, file);
  }
  uploadNotebook(
    organisationId: string,
    mlAlgorithmId: string,
    mlModelId: string,
    file: FormData,
  ): Promise<DataResponse<MlModelResource>> {
    const endpoint = `organisations/${organisationId}/ml_algorithms/${mlAlgorithmId}/ml_models/${mlModelId}/notebook`;
    return ApiService.postRequest(endpoint, file);
  }
}
