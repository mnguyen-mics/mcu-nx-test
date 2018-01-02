import ApiService, { DataListResponse } from '../ApiService';
import { AssetFileResource } from '../../models/assets/assets';

const assetFileService = {
  getAssetsFiles(organisationId: string, options: object = {}): Promise<DataListResponse<AssetFileResource>> {
    const endpoint = 'asset_files';
    const params = {
      organisation_id: organisationId,
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  },
  deleteAssetsFile(id: string, options: object = {}) {
    const endpoint = `asset_files/${id}`;
    const params = {
      ...options,
    };
    return ApiService.deleteRequest(endpoint, params);
  },
};

export default assetFileService;
