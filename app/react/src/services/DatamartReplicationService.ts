import {
  DatamartReplicationResourceShape,
  DatamartReplicationJobExecutionResource,
} from './../models/settings/settings';
import { PaginatedApiParam } from './../utils/ApiHelper';
import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { injectable } from 'inversify';

export interface DatamartReplicationOptions extends PaginatedApiParam {
  keywords?: string; // ?
  // archived?: string;
}

export interface IDatamartReplicationService {
  getDatamartReplications: (
    datamartId: string,
    options?: DatamartReplicationOptions,
  ) => Promise<DataListResponse<DatamartReplicationResourceShape>>;
  getDatamartReplication: (
    datamartId: string,
    datamartReplicationId: string,
  ) => Promise<DataResponse<DatamartReplicationResourceShape>>;
  createDatamartReplication: (
    datamartId: string,
    resource: Partial<DatamartReplicationResourceShape>,
  ) => Promise<DataResponse<DatamartReplicationResourceShape>>;
  updateDatamartReplication: (
    datamartId: string,
    datamartReplicationId: string,
    resource: Partial<DatamartReplicationResourceShape>,
  ) => Promise<DataResponse<DatamartReplicationResourceShape>>;
  deleteDatamartReplication: (
    datamartId: string,
    datamartReplicationId: string,
  ) => Promise<DataResponse<DatamartReplicationResourceShape>>;
  uploadDatamartReplicationCredentials: (
    datatamartId: string,
    datamartReplicationId: string,
    credentials: any,
  ) => Promise<any>;
  createJobExecution: (
    datamartId: string,
    option?: object,
  ) => Promise<DataResponse<DatamartReplicationJobExecutionResource>>;
  getJobExecutions: (
    datamartId: string,
  ) => Promise<DataListResponse<DatamartReplicationJobExecutionResource>>;
}

@injectable()
export class DatamartReplicationService implements IDatamartReplicationService {
  getDatamartReplications(
    datamartId: string,
    options: DatamartReplicationOptions = {},
  ): Promise<DataListResponse<DatamartReplicationResourceShape>> {
    const endpoint = `datamarts/${datamartId}/replications`;
    return ApiService.getRequest(endpoint, options);
  }
  getDatamartReplication(
    datamartId: string,
    datamartReplicationId: string,
  ): Promise<DataResponse<DatamartReplicationResourceShape>> {
    const endpoint = `datamarts/${datamartId}/replications/${datamartReplicationId}`;
    return ApiService.getRequest(endpoint);
  }
  createDatamartReplication(
    datamartId: string,
    resource: Partial<DatamartReplicationResourceShape>,
  ): Promise<DataResponse<DatamartReplicationResourceShape>> {
    const endpoint = `datamarts/${datamartId}/replications`;
    return ApiService.postRequest(endpoint, resource);
  }
  updateDatamartReplication(
    datamartId: string,
    datamartReplicationId: string,
    resource: Partial<DatamartReplicationResourceShape>,
  ): Promise<DataResponse<DatamartReplicationResourceShape>> {
    const endpoint = `datamarts/${datamartId}/replications/${datamartReplicationId}`;
    return ApiService.putRequest(endpoint, resource);
  }
  deleteDatamartReplication(
    datamartId: string,
    datamartReplicationId: string,
  ): Promise<DataResponse<DatamartReplicationResourceShape>> {
    const endpoint = `datamarts/${datamartId}/replications/${datamartReplicationId}`;
    return ApiService.deleteRequest(endpoint);
  }
  uploadDatamartReplicationCredentials(
    datamartId: string,
    datamartReplicationId: string,
    credentials: any = {},
  ): Promise<FormData | void> {
    const endpoint = `datamarts/${datamartId}/replications/${datamartReplicationId}/credentials`;
    if (credentials.fileName && credentials.fileContent) {
      const formData = new FormData();

      const blob = new Blob([credentials.fileContent], {
        type: 'application/octet-stream',
      }); /* global Blob */
      formData.append('file', blob, credentials.name);

      return ApiService.postRequest(endpoint, formData);
    }
    return Promise.reject();
  }
  createJobExecution(
    datamartId: string,
    option: object = {},
  ): Promise<DataResponse<DatamartReplicationJobExecutionResource>> {
    const endpoint = `datamarts/${datamartId}/replication_job_executions`;
    const options = {
      ...option,
    };
    return ApiService.postRequest(endpoint, options);
  }
  getJobExecutions(
    datamartId: string,
  ): Promise<DataListResponse<DatamartReplicationJobExecutionResource>> {
    const endpoint = `datamarts/${datamartId}/replication_job_executions`;
    return ApiService.getRequest(endpoint);
  }
}
