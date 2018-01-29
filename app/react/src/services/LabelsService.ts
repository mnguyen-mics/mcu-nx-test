import ApiService from './ApiService';

const getLabels = (organisationId: string, options = {}) => {
  const endpoint = 'labels';

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const updateLabel = (labelId: string, name: string, organisationId: string) => {
  const endpoint = `labels/${labelId}`;
  const body = {
    id: labelId,
    name,
    organisation_id: organisationId
  };
  return ApiService.putRequest(endpoint, body);
};

const createLabel = (name: string, organisationId: string, options = {}) => {
  const endpoint = 'labels';
  const params = {
    name,
    organisation_id: organisationId,
    ...options,
  };
  return ApiService.postRequest(endpoint, params);
};

const deleteLabel = (labelId: string) => {
  const endpoint = `labels/${labelId}`;
  return ApiService.deleteRequest(endpoint);
};

const pairLabels = (labelId: string, labelableType: string, labelableId: string) => {
  const endpoint = `labels/${labelId}/links/${labelableType}/${labelableId}`;
  return ApiService.postRequest(endpoint, {});
};

const unPairLabels = (labelId: string, labelableType: string, labelableId: string) => {
  const endpoint = `labels/${labelId}/links/${labelableType}/${labelableId}`;
  return ApiService.deleteRequest(endpoint, {});
};

export default {
  getLabels,
  updateLabel,
  createLabel,
  deleteLabel,
  pairLabels,
  unPairLabels,
};
