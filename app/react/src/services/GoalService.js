import ApiService from './ApiService.ts';

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

  return ApiService.getRequest(endpoint, options);
};

const updateGoal = (id, body) => {
  const endpoint = `goals/${id}`;
  return ApiService.putRequest(endpoint, body);
};

const updateGoalDeprecated = (campaignId, id, orgId, body = {}) => {
  const endpoint = `goals/${id}`;
  return ApiService.putRequest(endpoint, body);
};

const createGoal = (organisationId, options = {}) => {
  const endpoint = `goals?organisation_id=${organisationId}`;

  return ApiService.postRequest(endpoint, options);
};


const createAttributionModel = (goalId, options = {}) => {
  const endpoint = `goals/${goalId}/attribution_models`;

  return ApiService.postRequest(endpoint, options);
};

const getAttributionModel = (goalId, options = {}) => {
  const endpoint = `goals/${goalId}/attribution_models`;
  return ApiService.getRequest(endpoint, options);
};

export default {
  getGoals,
  getGoal,
  updateGoal,
  createGoal,
  createAttributionModel,
  getAttributionModel,
  updateGoalDeprecated,
};
