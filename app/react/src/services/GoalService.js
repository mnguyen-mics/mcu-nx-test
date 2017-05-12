import ApiService from './ApiService';

const getGoals = (organisationId, options = {}) => {
  const endpoint = 'goals';

  const params = {
    organisation_id: organisationId,
    ...options
  };

  return ApiService.getRequest(endpoint, params);
};

export default {
  getGoals
};
