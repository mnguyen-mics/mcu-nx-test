import { PaginatedApiParam } from './../../utils/ApiHelper';
import ApiService, { DataListResponse, DataResponse } from '../ApiService';
import {
  Export,
  ExportCreateResource,
  ExportExecution,
} from '../../models/exports/exports';
import { injectable } from 'inversify';

export interface GetExportOptions extends PaginatedApiParam {
  keywords?: string;
  organisation_id: string;
}

export interface IExportService {
  getExports: (options?: object) => Promise<DataListResponse<Export>>;
  deleteExport: (id: string, options?: object) => Promise<DataResponse<any>>;
  getExport: (id: string, options?: object) => Promise<DataResponse<Export>>;
  getExportExecutions: (
    id: string,
    options?: object,
  ) => Promise<DataListResponse<ExportExecution>>;
  createExport: (
    organisationId: string,
    payload: ExportCreateResource | Partial<Export>,
  ) => Promise<DataResponse<Export>>;
  updateExport: (
    exportId: string,
    payload: ExportCreateResource | Partial<Export>,
  ) => Promise<DataResponse<Export>>;
  createExecution: (
    id: string,
    option?: object,
  ) => Promise<DataResponse<ExportExecution>>;
}

@injectable()
export class ExportService implements IExportService {
  getExports(options: object = {}): Promise<DataListResponse<Export>> {
    const endpoint = `exports`;
    return ApiService.getRequest(endpoint, options);
  }
  deleteExport(id: string, options: object = {}): Promise<DataResponse<any>> {
    const endpoint = `exports/${id}`;
    return ApiService.deleteRequest(endpoint, options);
  }
  getExport(id: string, options: object = {}): Promise<DataResponse<Export>> {
    const endpoint = `exports/${id}`;
    return ApiService.getRequest(endpoint, options);
  }
  getExportExecutions(
    id: string,
    options: object = {},
  ): Promise<DataListResponse<ExportExecution>> {
    const endpoint = `exports/${id}/executions`;
    return ApiService.getRequest(endpoint, options);
  }
  createExport(
    organisationId: string,
    payload: ExportCreateResource | Partial<Export>,
  ): Promise<DataResponse<Export>> {
    const endpoint = `exports?organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, payload);
  }
  updateExport(
    exportId: string,
    payload: ExportCreateResource | Partial<Export>,
  ): Promise<DataResponse<Export>> {
    const endpoint = `exports/${exportId}`;
    return ApiService.putRequest(endpoint, payload);
  }
  createExecution(
    id: string,
    option: object = {},
  ): Promise<DataResponse<ExportExecution>> {
    const endpoint = `exports/${id}/executions`;
    const options = {
      ...option,
    };
    return ApiService.postRequest(endpoint, options);
  }
}
