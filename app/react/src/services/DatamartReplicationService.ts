import { PaginatedApiParam } from './../utils/ApiHelper';
import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { DatamartReplicationResource } from '../models/settings/settings';
import { injectable } from 'inversify';

export interface DatamartReplicationOptions extends PaginatedApiParam {
  keywords?: string; // ?
  // archived?: string;
}

export interface IDatamartReplicationService {
  getDatamartReplications: (
    datamartId: string,
    options: DatamartReplicationOptions,
  ) => Promise<DataListResponse<DatamartReplicationResource>>;
  getDatamartReplication: (
    datamartId: string,
    datamartReplicationId: string,
  ) => Promise<DataResponse<DatamartReplicationResource>>;
}

@injectable()
export class DatamartReplicationService implements IDatamartReplicationService {
  getDatamartReplications(
    datamartId: string,
    options: DatamartReplicationOptions = {},
  ): Promise<DataListResponse<DatamartReplicationResource>> {
    const endpoint = `datamarts/${datamartId}/replications`;

    return ApiService.getRequest(endpoint, options);
  }
  getDatamartReplication(
    datamartId: string,
    datamartReplicationId: string,
  ): Promise<DataResponse<DatamartReplicationResource>> {
    const endpoint = `datamarts/${datamartId}/replications/${datamartReplicationId}`;

    return ApiService.getRequest(endpoint);
  }
}
