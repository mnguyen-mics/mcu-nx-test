import ApiService from './ApiService';

const getLabels = (organisationId, options = {}) => {
  const endpoint = 'labels';

  const params = {
    organisation_id: organisationId,
    ...options
  };

  return ApiService.getRequest(endpoint, params);
};

const updateLabel = (labelId, name) => {
  const endpoint = `label/${labelId}`;
  const body = {
    name
  };
  return ApiService.putRequest(endpoint, body);
};

const createLabel = (name, organisationId, options = {}) => {
  const endpoint = 'labels';
  const params = {
    name,
    organisation_id: organisationId,
    ...options
  };
  return ApiService.postRequest(endpoint, params);
};

const deleteLabel = (labelId) => {
  const endpoint = `labels/${labelId}`;
  return ApiService.deleteRequest(endpoint);
};

const pairLabels = (labelId, labelableType, labelableId) => {
  const endpoint = `labels/${labelId}/links/${labelableType}/${labelableId}`;
  return ApiService.postRequest(endpoint);
};

const unPairLabels = (labelId, labelableType, labelableId) => {
  const endpoint = `labels/${labelId}/links/${labelableType}/${labelableId}`;
  return ApiService.deleteRequest(endpoint);
};

export default {
  getLabels,
  updateLabel,
  createLabel,
  deleteLabel,
  pairLabels,
  unPairLabels
};
