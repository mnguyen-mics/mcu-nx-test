import ApiService from './ApiService';

const getSegments = (organisationId, datamartId, options = {}) => {
  const endpoint = 'audience_segments';

  const params = {
    organisation_id: organisationId,
    datamart_id: datamartId,
    ...options
  };

  return ApiService.getRequest(endpoint, params);
};

export default {
  getSegments
};
