import ApiService, { DataResponse, DataListResponse } from './ApiService';
import { AudiencePartitionResource } from '../models/audiencePartition/AudiencePartitionResource';

const AudiencePartitionsService = {
  getPartitions(
    organisationId: string,
    datamartId: string,
    options: object = {},
  ): Promise<DataListResponse<AudiencePartitionResource>> {
    const endpoint = 'audience_partitions';

    const params = {
      organisation_id: organisationId,
      datamart_id: datamartId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  },
  getPartition(
    partitionId: string,
  ): Promise<DataResponse<AudiencePartitionResource>> {
    const endpoint = `audience_partitions/${partitionId}`;
    return ApiService.getRequest(endpoint);
  },
  savePartition(
    partitionId: string,
    body: Partial<AudiencePartitionResource> = {},
  ): Promise<DataResponse<AudiencePartitionResource>> {
    const endpoint = `audience_partitions/${partitionId}`;
    return ApiService.putRequest(endpoint, body);
  },
  publishPartition(
    partitionId: string,
    body: Partial<AudiencePartitionResource> = {},
  ): Promise<DataResponse<AudiencePartitionResource>> {
    const endpoint = `audience_partitions/${partitionId}/publish`;
    return ApiService.putRequest(endpoint, body);
  },
  createPartition(
    organisationId: string,
    datamartId: string,
    body: Partial<AudiencePartitionResource> = {},
  ): Promise<DataResponse<AudiencePartitionResource>> {
    const endpoint = `audience_partitions?datamart_id=${datamartId}&organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, body);
  },
  archiveAudiencePartition(
    partitionId: string,
    body: Partial<AudiencePartitionResource> = {},
  ): Promise<DataResponse<AudiencePartitionResource>> {
    const endpoint = `audience_partitions/${partitionId}`;
    return ApiService.putRequest(endpoint, body);
  },
};

export default AudiencePartitionsService;
