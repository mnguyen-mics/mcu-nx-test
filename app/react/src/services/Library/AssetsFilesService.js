import ApiService from '../ApiService.ts';

const getAssetsFiles = (organisationId, options = {}) => {
  const endpoint = 'asset_files';

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

export default {
  getAssetsFiles,
};
