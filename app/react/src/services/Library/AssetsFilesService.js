import ApiService from '../ApiService';

const getAssetsFiles = (organisationId, options = {}) => {
  const endpoint = 'asset_files';

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const deleteAssetsFile = (id, options = {}) => {
  const endpoint = `asset_files/${id}`;

  const params = {
    ...options,
  };

  return ApiService.deleteRequest(endpoint, params);
};

export default {
  getAssetsFiles,
  deleteAssetsFile,
};
