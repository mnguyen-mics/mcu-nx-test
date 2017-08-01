import ApiService from './ApiService';

const getScenarios = (organisationId, options = {}) => {
  const endpoint = 'scenarios';

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

export default {
  getScenarios,
};
