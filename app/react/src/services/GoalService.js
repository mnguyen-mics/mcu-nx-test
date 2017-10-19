import ApiService from './ApiService';

const getGoals = (organisationId, options = {}) => {
  const endpoint = 'goals';

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const getGoal = (goaldId, options = {}) => {
  const endpoint = `goals/${goaldId}`;

  const params = {
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const updateGoal = ({ id, body = {} }) => {
  const endpoint = `goals/${id}`;

  const params = {
    ...body,
  };

  return ApiService.putRequest(endpoint, params);
};

const createGoal = (organisationId, options = {}) => {
  const endpoint = `goals?organisation_id=${organisationId}`;

  const params = {
    ...options,
  };

  return ApiService.postRequest(endpoint, params);
};


const createAttributionModel = (goalId, options = {}) => {
  const endpoint = `goals/${goalId}/attribution_models`;
  const params = {
    ...options,
  };
  return ApiService.postRequest(endpoint, params);
};

export default {
  getGoals,
  getGoal,
  updateGoal,
  createGoal,
  createAttributionModel
};
