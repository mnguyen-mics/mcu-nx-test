import ApiService, { DataListResponse, DataResponse } from '../ApiService';
import { Export, ExportCreateResource, ExportExecution } from '../../models/exports/exports';

const ExportService = {
  getExports(organisationId: string, options: object = {}): Promise<DataListResponse<Export>> {
    const endpoint = 'exports';

    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  },
  deleteExport(id: string, options: object = {}): Promise<DataResponse<any>> {
    const endpoint = `exports/${id}`;
    return ApiService.deleteRequest(endpoint, options);
  },
  getExport(id: string, options: object = {}): Promise<DataResponse<Export>> {
    const endpoint = `exports/${id}`;
    return ApiService.getRequest(endpoint, options);
  },
  getExportExecutions(id: string, options: object = {}): Promise<DataListResponse<ExportExecution>> {
    const endpoint = `exports/${id}/executions`;
    return ApiService.getRequest(endpoint, options);
  },
  createExport(organisationId: string, payload: ExportCreateResource  | Partial<Export>): Promise<DataResponse<Export>> {
    const endpoint = `exports?organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, payload)
  },
  updateExport(exportId: string, payload: ExportCreateResource | Partial<Export>): Promise<DataResponse<Export>> {
    const endpoint = `exports/${exportId}`;
    return ApiService.putRequest(endpoint, payload)
  },
  createExecution(id: string, option: object = {}): Promise<DataResponse<ExportExecution>> {
    const endpoint = `exports/${id}/executions`;
    const options = {
      ...option,
    }
    return ApiService.postRequest(endpoint, options);
  }
};

export default ExportService;
