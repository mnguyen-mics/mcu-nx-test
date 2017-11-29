import ApiService from '../ApiService';

const getExports = (organisationId, options = {}) => {
  const endpoint = 'exports';

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const deleteExport = (id, options = {}) => {
  const endpoint = 'exports/${}';
  return ApiService.getRequest(endpoint, options);
};

export default {
  getExports,
  deleteExport,
};
