import ApiService from './ApiService';

const getDatamarts = (organisationId, options = {}) => {
  const endpoint = 'datamarts';

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const getDatamart = (datamartId) => {
  const endpoint = `datamarts/${datamartId}`;
  return ApiService.getRequest(endpoint);
};

export default {
  getDatamarts,
  getDatamart,
};
