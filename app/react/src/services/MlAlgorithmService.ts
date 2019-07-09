import ApiService, { DataListResponse, DataResponse } from './ApiService';

import { injectable } from 'inversify';
import MlAlgorithmResource from '../models/mlAlgorithm/MlAlgorithmResource';

export interface IMlAlgorithmService {
    getMlAlgorithms: (
        organisationId: string,
        filters?: object,
    ) => Promise<DataListResponse<MlAlgorithmResource>>;
    getMlAlgorithm: (
        organisationId: string,
        mlAlgorithmId: string,
    ) => Promise<DataResponse<MlAlgorithmResource>>;
    createMlAlgorithm: (
        organisationId: string,
        body: Partial<MlAlgorithmResource>
    ) => Promise<DataResponse<MlAlgorithmResource>>;
    updateMlAlgorithm: (
        organisationId: string,
        mlAlgorithmId: string,
        body: Partial<MlAlgorithmResource>,
    ) => Promise<DataResponse<MlAlgorithmResource>>
}

@injectable()
export class MlAlgorithmService implements IMlAlgorithmService {
    getMlAlgorithms(
        organisationId: string,
        filters: object = {},
  ): Promise<DataListResponse<MlAlgorithmResource>> {
    const endpoint = `organisations/${organisationId}/ml_algorithms`;
    const options = {
      organisation_id: organisationId,
      ...filters,
    };
    return ApiService.getRequest(endpoint, options);
  }
  getMlAlgorithm(
    organisationId: string,
    mlAlgorithmId: string,
  ): Promise<DataResponse<MlAlgorithmResource>> {
    const endpoint = `organisations/${organisationId}/ml_algorithms/${mlAlgorithmId}`;
    return ApiService.getRequest(endpoint);
  }
  createMlAlgorithm(
    organisationId: string,
    body: Partial<MlAlgorithmResource>,
  ): Promise<DataResponse<MlAlgorithmResource>> {
    const endpoint = `organisations/${organisationId}/ml_algorithms`;
    return ApiService.postRequest(endpoint, body);
  }
  updateMlAlgorithm(
    organisationId: string,
    mlAlgorithmId: string,
    body: Partial<MlAlgorithmResource>,
  ): Promise<DataResponse<MlAlgorithmResource>> {
    const endpoint =  `organisations/${organisationId}/ml_algorithms/${mlAlgorithmId}`;
    return ApiService.putRequest(endpoint, body);
  }

}