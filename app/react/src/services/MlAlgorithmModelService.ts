import { injectable } from 'inversify';
import MlAlgorithmModelResource from '../models/mlAlgorithmModel/MlAlgorithmModelResource';
import { ApiService } from '@mediarithmics-private/advanced-components';
import {
  DataListResponse,
  DataResponse,
} from '@mediarithmics-private/advanced-components/lib/services/ApiService';

export interface IMlAlgorithmModelService {
  getMlAlgorithmModels: (
    organisationId: string,
    mlAlgorithmId: string,
    filters?: object,
  ) => Promise<DataListResponse<MlAlgorithmModelResource>>;
  getMlAlgorithmModel: (
    mlAlgorithmId: string,
    mlAlgorithmModelId: string,
  ) => Promise<DataResponse<MlAlgorithmModelResource>>;
  createMlAlgorithmModel: (
    mlAlgorithmId: string,
    body: Partial<MlAlgorithmModelResource>,
  ) => Promise<DataResponse<MlAlgorithmModelResource>>;
  updateMlAlgorithmModel: (
    mlAlgorithmId: string,
    mlAlgorithmModelId: string,
    body: Partial<MlAlgorithmModelResource>,
  ) => Promise<DataResponse<MlAlgorithmModelResource>>;
  uploadResult: (
    mlAlgorithmId: string,
    mlAlgorithmModelId: string,
    file: FormData,
  ) => Promise<DataResponse<MlAlgorithmModelResource>>;
  uploadBinary: (
    mlAlgorithmId: string,
    mlAlgorithmModelId: string,
    file: FormData,
  ) => Promise<DataResponse<MlAlgorithmModelResource>>;
  uploadNotebook: (
    mlAlgorithmId: string,
    mlAlgorithmModelId: string,
    file: FormData,
  ) => Promise<DataResponse<MlAlgorithmModelResource>>;
}

@injectable()
export class MlAlgorithmModelService implements IMlAlgorithmModelService {
  getMlAlgorithmModels(
    organisationId: string,
    mlAlgorithmId: string,
    filters: object = {},
  ): Promise<DataListResponse<MlAlgorithmModelResource>> {
    const endpoint = `ml_algorithms/${mlAlgorithmId}/models`;
    const options = {
      organisation_id: organisationId,
      ...filters,
    };
    return ApiService.getRequest(endpoint, options);
  }
  getMlAlgorithmModel(
    mlAlgorithmId: string,
    mlAlgorithmModelId: string,
  ): Promise<DataResponse<MlAlgorithmModelResource>> {
    const endpoint = `ml_algorithms/${mlAlgorithmId}/models/${mlAlgorithmModelId}`;
    return ApiService.getRequest(endpoint);
  }
  createMlAlgorithmModel(
    mlAlgorithmId: string,
    body: Partial<MlAlgorithmModelResource>,
  ): Promise<DataResponse<MlAlgorithmModelResource>> {
    const endpoint = `ml_algorithms/${mlAlgorithmId}/models`;
    return ApiService.postRequest(endpoint, body);
  }
  updateMlAlgorithmModel(
    mlAlgorithmId: string,
    mlAlgorithmModelId: string,
    body: Partial<MlAlgorithmModelResource>,
  ): Promise<DataResponse<MlAlgorithmModelResource>> {
    const endpoint = `ml_algorithms/${mlAlgorithmId}/models/${mlAlgorithmModelId}`;
    return ApiService.putRequest(endpoint, body);
  }
  uploadResult(
    mlAlgorithmId: string,
    mlAlgorithmModelId: string,
    file: FormData,
  ): Promise<DataResponse<MlAlgorithmModelResource>> {
    const endpoint = `ml_algorithms/${mlAlgorithmId}/models/${mlAlgorithmModelId}/result`;
    return ApiService.postRequest(endpoint, file);
  }
  uploadBinary(
    mlAlgorithmId: string,
    mlAlgorithmModelId: string,
    file: FormData,
  ): Promise<DataResponse<MlAlgorithmModelResource>> {
    const endpoint = `ml_algorithms/${mlAlgorithmId}/models/${mlAlgorithmModelId}/binary`;
    return ApiService.postRequest(endpoint, file);
  }
  uploadNotebook(
    mlAlgorithmId: string,
    mlAlgorithmModelId: string,
    file: FormData,
  ): Promise<DataResponse<MlAlgorithmModelResource>> {
    const endpoint = `ml_algorithms/${mlAlgorithmId}/models/${mlAlgorithmModelId}/notebook`;
    return ApiService.postRequest(endpoint, file);
  }
}
