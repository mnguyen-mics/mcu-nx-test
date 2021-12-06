import { Import, ImportExecution, MakeJobExecutionAction } from './../models/imports/imports';
import { injectable } from 'inversify';
import { ApiService } from '@mediarithmics-private/advanced-components';
import {
  DataListResponse,
  DataResponse,
} from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { PaginatedApiParam } from '../utils/ApiHelper';

export interface GetImportsOptions extends PaginatedApiParam {
  keywords?: string;
  label_ids?: string[];
}

export interface IImportService {
  getImportList: (
    datamartId: string,
    options: GetImportsOptions,
  ) => Promise<DataListResponse<Import>>;
  getImport: (datamartId: string, importId: string) => Promise<DataResponse<Import>>;
  createImport: (datamartId: string, body: Partial<Import>) => Promise<DataResponse<Import>>;
  updateImport: (
    datamartId: string,
    importId: string,
    body: Partial<Import>,
  ) => Promise<DataResponse<Import>>;
  deleteImport: (datamartId: string, importId: string) => Promise<DataResponse<Import>>;
  createImportExecution: (
    datamartId: string,
    importId: string,
    file: FormData,
  ) => Promise<DataResponse<any>>;
  getImportExecutions: (
    datamartId: string,
    importId: string,
    options: object,
  ) => Promise<DataListResponse<ImportExecution>>;
  cancelImportExecution: (
    datamartId: string,
    importId: string,
    executionId: string,
  ) => Promise<DataResponse<ImportExecution>>;
}

@injectable()
export class ImportService implements IImportService {
  getImportList(datamartId: string, options: object = {}): Promise<DataListResponse<Import>> {
    const endpoint = `datamarts/${datamartId}/document_imports`;
    const params = {
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  }
  getImport(datamartId: string, importId: string): Promise<DataResponse<Import>> {
    const endpoint = `datamarts/${datamartId}/document_imports/${importId}`;
    return ApiService.getRequest(endpoint);
  }
  createImport(datamartId: string, body: Partial<Import>): Promise<DataResponse<Import>> {
    const endpoint = `datamarts/${datamartId}/document_imports`;
    return ApiService.postRequest(endpoint, body);
  }
  updateImport(
    datamartId: string,
    importId: string,
    body: Partial<Import>,
  ): Promise<DataResponse<Import>> {
    const endpoint = `datamarts/${datamartId}/document_imports/${importId}`;
    return ApiService.putRequest(endpoint, body);
  }
  deleteImport(datamartId: string, importId: string): Promise<DataResponse<Import>> {
    const endpoint = `datamarts/${datamartId}/document_imports/${importId}`;
    return ApiService.deleteRequest(endpoint);
  }
  createImportExecution(
    datamartId: string,
    importId: string,
    file: FormData,
  ): Promise<DataResponse<any>> {
    const endpoint = `datamarts/${datamartId}/document_imports/${importId}/executions`;
    return ApiService.postRequest(endpoint, file);
  }
  getImportExecutions(
    datamartId: string,
    importId: string,
    options: object = {},
  ): Promise<DataListResponse<ImportExecution>> {
    const endpoint = `datamarts/${datamartId}/document_imports/${importId}/executions`;
    return ApiService.getRequest(endpoint, options);
  }
  cancelImportExecution(
    datamartId: string,
    importId: string,
    executionId: string,
  ): Promise<DataResponse<ImportExecution>> {
    const endpoint = `datamarts/${datamartId}/document_imports/${importId}/executions/${executionId}/action`;
    const action: MakeJobExecutionAction = {
      action: 'CANCEL',
    };
    return ApiService.postRequest(endpoint, action);
  }
}
