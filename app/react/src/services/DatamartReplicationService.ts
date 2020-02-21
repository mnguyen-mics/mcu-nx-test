import {
  DatamartReplicationResourceShape,
  DatamartReplicationJobExecutionResource,
} from './../models/settings/settings';
import { PaginatedApiParam } from './../utils/ApiHelper';
import ApiService, {
  DataListResponse,
  DataResponse,
  StatusCode,
} from './ApiService';
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
  getJobExecutions: (
    datamartId: string,
  ) => Promise<DataListResponse<DatamartReplicationJobExecutionResource>>;
  //
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
  async uploadDatamartReplicationCredentials(
    datamartId: string,
    datamartReplicationId: string,
    credentials: any = {},
  ): Promise<any> {
    const endpoint = `datamarts/${datamartId}/replications/${datamartReplicationId}/credentials`;
    if (credentials.fileName && credentials.fileContent) {
      const formData = new FormData();

      const blob = new Blob([credentials.fileContent], {
        type: 'application/octet-stream',
      }); /* global Blob */
      formData.append('file', blob, credentials.name);

      return ApiService.postRequest(endpoint, formData);
    }
  }
  getJobExecutions(
    datamartId: string,
  ): Promise<DataListResponse<DatamartReplicationJobExecutionResource>> {
    // TO DO: remove mocked data when route to retrieve executions is done
    // const endpoint = ``
    // return ApiService.getRequest(endpoint);
    const executions: DatamartReplicationJobExecutionResource[] = [
      {
        id: '1',
        status: 'PENDING',
        creation_date: 1563358014075,
        start_date: 1563358014075,
        duration: 20386,
        organisation_id: '504',
        user_id: '1330',
        num_tasks: 100,
        completed_tasks: 75,
        erroneous_tasks: 0,
        external_model_name: 'PUBLIC_DATAMART',
      },
      {
        id: '2',
        status: 'RUNNING',
        creation_date: 1581960211000,
        start_date: 1563358014075,
        duration: 35386,
        organisation_id: '504',
        user_id: '1330',
        num_tasks: 100,
        completed_tasks: 100,
        erroneous_tasks: 0,
        external_model_name: 'PUBLIC_DATAMART',
      },
      {
        id: '3',
        status: 'FAILED',
        creation_date: 1563358014075,
        start_date: 1563358014075,
        duration: 18386,
        organisation_id: '504',
        user_id: '1330',
        num_tasks: 100,
        completed_tasks: 75,
        erroneous_tasks: 1,
        external_model_name: 'PUBLIC_DATAMART',
        result: {
          total_failure: 1,
        },
      },
      {
        id: '4',
        status: 'PENDING',
        creation_date: 1563358014075,
        start_date: 1563358014075,
        duration: 5386,
        organisation_id: '504',
        user_id: '1330',
        num_tasks: 100,
        completed_tasks: 25,
        erroneous_tasks: 0,
        external_model_name: 'PUBLIC_DATAMART',
      },
      {
        id: '5',
        status: 'SUCCESS',
        creation_date: 1563358014075,
        start_date: 1563358014075,
        duration: 22386,
        organisation_id: '504',
        user_id: '1330',
        num_tasks: 100,
        completed_tasks: 100,
        erroneous_tasks: 0,
        external_model_name: 'PUBLIC_DATAMART',
      },
    ];
    return Promise.resolve({
      status: 'ok' as StatusCode,
      data: executions,
      count: 5,
    });
  }
}
