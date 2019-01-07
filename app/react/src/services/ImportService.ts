import { Import } from './../models/imports/imports';
import { injectable } from 'inversify';
import ApiService, { DataListResponse, DataResponse } from './ApiService';

export interface IImportService {
  getImportList: (
    datamartId: string,
    options: object,
  ) => Promise<DataListResponse<Import>>;
  getImport: (
    datamartId: string,
    importId: string,
  ) => Promise<DataResponse<Import>>;
  createImport: (
    datamartId: string,
    body: Partial<Import>,
  ) => Promise<DataResponse<Import>>;
  updateImport: (
    datamartId: string,
    importId: string,
    body: Partial<Import>,
  ) => Promise<DataResponse<Import>>;
  deleteImport: (
    datamartId: string,
    importId: string,
  ) => Promise<DataResponse<Import>>;
  createImportExecution: (
    datamartId: string,
    importId: string,
    file: FormData,
  ) => Promise<DataResponse<any>>;
  getImportExecutions: (
    datamartId: string,
    importId: string,
  ) => Promise<DataListResponse<any>>;
}

@injectable()
export class ImportService implements IImportService {
  getImportList(
    datamartId: string,
    options: object = {},
  ): Promise<DataListResponse<Import>> {
    const endpoint = `datamarts/${datamartId}/document_imports`;
    const params = {
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  }
  getImport(
    datamartId: string,
    importId: string,
  ): Promise<DataResponse<Import>> {
    const endpoint = `datamarts/${datamartId}/document_imports/${importId}`;
    return ApiService.getRequest(endpoint);
  }
  createImport(
    datamartId: string,
    body: Partial<Import>,
  ): Promise<DataResponse<Import>> {
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
  deleteImport(
    datamartId: string,
    importId: string,
  ): Promise<DataResponse<Import>> {
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
  ): Promise<DataListResponse<any>> {
    const endpoint = `datamarts/${datamartId}/document_imports/${importId}/executions`;
    return ApiService.getRequest(endpoint, {});
  }
}
