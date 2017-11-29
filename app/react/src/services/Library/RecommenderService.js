import ApiService from '../ApiService';
import PluginService from '../PluginService';

const getRecommenders = (organisationId, options = {}) => {
  const endpoint = 'recommenders';

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const getRecommenderProperty = (id, options = {}) => {
  const endpoint = `recommenders/${id}/properties`;

  return ApiService.getRequest(endpoint, options);
};

const deleteRecommender = (id, options = {}) => {
  const endpoint = `recommenders/${id}`;

  const params = {
    ...options,
  };
  return ApiService.deleteRequest(endpoint, params);
};

const getRecommender = (id, options = {}) => {
  const endpoint = `recommenders/${id}`;

  const params = {
    ...options,
  };
  return ApiService.getRequest(endpoint, params);
};

const createRecommender = (organisationId, options = {}) => {
  const endpoint = `recommenders?organisation_id=${organisationId}`;

  const params = {
    ...options,
  };

  return ApiService.postRequest(endpoint, params);
};

const updateRecommender = (id, options = {}) => {
  const endpoint = `recommenders/${id}`;

  const params = {
    ...options,
  };

  return ApiService.putRequest(endpoint, params);
};

const updateRecommenderProperty = (organisationId, id, technicalName, params = {}) => {
  const endpoint = `recommenders/${id}/properties/technical_name=${technicalName}`;
  return PluginService.handleSaveOfProperties(params, organisationId, 'recommenders', id, endpoint);
};

export default {
  getRecommenders,
  getRecommenderProperty,
  getRecommender,
  createRecommender,
  updateRecommender,
  updateRecommenderProperty,
  deleteRecommender,
};
