import ApiService, { DataListResponse, DataResponse } from '../ApiService';
import { Export } from '../../models/exports/exports';

const exportService = {
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
    return ApiService.getRequest(endpoint, options);
  },
};

export default exportService;
