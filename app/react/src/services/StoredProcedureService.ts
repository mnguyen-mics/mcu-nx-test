import ApiService, { DataResponse, DataListResponse } from './ApiService';
import { injectable } from 'inversify';
import { StoredProcedureResource } from '../models/datamart/StoredProcedure';

export interface IStoredProcedureService {
  listStoredProcedure: (
    options?: StoredProcedureQueryStringParameters
  ) => Promise<DataListResponse<StoredProcedureResource>>;
  getStoredProcedure: (
    storedProcedureId: string,
  ) => Promise<DataResponse<StoredProcedureResource>>;
  createStoredProcedure: (
    storedProcedure: Partial<StoredProcedureResource>
  ) => Promise<DataResponse<StoredProcedureResource>>
}

export interface StoredProcedureQueryStringParameters {
  datamart_id?: string;
  first_result?: number;
  max_results?: number;
  order_by?: string;
  keywords?: string;
}

@injectable()
export class StoredProcedureService implements IStoredProcedureService {
  listStoredProcedure(
    options?: StoredProcedureQueryStringParameters
  ): Promise<DataListResponse<StoredProcedureResource>> {
    const endpoint = `stored_procedures`;
    return ApiService.getRequest(endpoint);
  }
  getStoredProcedure(
    storedProcedureId: string,
  ): Promise<DataResponse<StoredProcedureResource>> {
    const endpoint = `stored_procedures/${storedProcedureId}`;
    return ApiService.getRequest(endpoint, {});
  }
  createStoredProcedure(
    storedProcedure: Partial<StoredProcedureResource>
  ): Promise<DataResponse<StoredProcedureResource>> {
    const endpoint = `stored_procedures`;
    return ApiService.postRequest(endpoint, storedProcedure);
  }
}
