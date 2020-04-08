import ApiService, { DataResponse, DataListResponse } from './ApiService';
import {
  AudiencePartitionResource,
  AudiencePartitionType,
  AudiencePartitionStatus,
} from '../models/audiencePartition/AudiencePartitionResource';
import { PaginatedApiParam } from '../utils/ApiHelper';
import { injectable } from 'inversify';

export interface GetPartitionOption extends PaginatedApiParam {
  datamart_id?: string;
  type?: AudiencePartitionType[];
  status?: AudiencePartitionStatus[];
  keywords?: string;
  name?: string;
  archived?: boolean;
}

export interface IAudiencePartitionsService {
  getPartitions(
    organisationId: string,
    options: GetPartitionOption,
  ): Promise<DataListResponse<AudiencePartitionResource>>;
  getPartition(
    partitionId: string,
  ): Promise<DataResponse<AudiencePartitionResource>>;
  savePartition(
    partitionId: string,
    body: Partial<AudiencePartitionResource>,
  ): Promise<DataResponse<AudiencePartitionResource>>;
  publishPartition(
    partitionId: string,
    body: Partial<AudiencePartitionResource>,
  ): Promise<DataResponse<AudiencePartitionResource>>;
  createPartition(
    organisationId: string,
    datamartId: string,
    body: Partial<AudiencePartitionResource>,
  ): Promise<DataResponse<AudiencePartitionResource>>;
  archiveAudiencePartition(
    partitionId: string,
    body: Partial<AudiencePartitionResource>,
  ): Promise<DataResponse<AudiencePartitionResource>>;
}

@injectable()
export class AudiencePartitionsService implements IAudiencePartitionsService {
  getPartitions(
    organisationId: string,
    options: GetPartitionOption = {},
  ): Promise<DataListResponse<AudiencePartitionResource>> {
    const endpoint = 'audience_partitions';

    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  }
  getPartition(
    partitionId: string,
  ): Promise<DataResponse<AudiencePartitionResource>> {
    const endpoint = `audience_partitions/${partitionId}`;
    return ApiService.getRequest(endpoint);
  }
  savePartition(
    partitionId: string,
    body: Partial<AudiencePartitionResource> = {},
  ): Promise<DataResponse<AudiencePartitionResource>> {
    const endpoint = `audience_partitions/${partitionId}`;
    return ApiService.putRequest(endpoint, body);
  }
  publishPartition(
    partitionId: string,
    body: Partial<AudiencePartitionResource> = {},
  ): Promise<DataResponse<AudiencePartitionResource>> {
    const endpoint = `audience_partitions/${partitionId}/publish`;
    return ApiService.putRequest(endpoint, body);
  }
  createPartition(
    organisationId: string,
    datamartId: string,
    body: Partial<AudiencePartitionResource> = {},
  ): Promise<DataResponse<AudiencePartitionResource>> {
    const endpoint = `audience_partitions?datamart_id=${datamartId}&organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, body);
  }
  archiveAudiencePartition(
    partitionId: string,
    body: Partial<AudiencePartitionResource> = {},
  ): Promise<DataResponse<AudiencePartitionResource>> {
    const endpoint = `audience_partitions/${partitionId}`;
    return ApiService.putRequest(endpoint, body);
  }
}
