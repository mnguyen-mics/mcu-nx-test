import ApiService from './ApiService';

const getConsents = (organisationId, options = {}) => {
  const endpoint = 'consents';

  const params = {
    organisation_id: organisationId,
    ...options
  };

  return ApiService.getRequest(endpoint, params);
};

export default {
  getConsents
};
