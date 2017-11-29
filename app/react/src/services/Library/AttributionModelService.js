import ApiService from '../ApiService';
import PluginService from '../PluginService';

const getAttributionModels = (organisationId, options = {}) => {
  const endpoint = 'attribution_models';

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const getAttributionModel = (id, options = {}) => {
  const endpoint = `attribution_models/${id}`;

  const params = {
    ...options,
  };
  return ApiService.getRequest(endpoint, params);
};

const deleteAttributionModel = (id, options = {}) => {
  const endpoint = `attribution_models/${id}`;

  const params = {
    ...options,
  };
  return ApiService.deleteRequest(endpoint, params);
};

const getAttributionModelProperties = (id, options = {}) => {
  const endpoint = `attribution_models/${id}/properties`;

  const params = {
    ...options,
  };
  return ApiService.getRequest(endpoint, params);
};

const createAttributionModel = (organisationId, options = {}) => {
  const endpoint = `attribution_models?organisation_id=${organisationId}`;

  const params = {
    ...options,
  };

  return ApiService.postRequest(endpoint, params);
};

const updateAttributionModel = (id, options = {}) => {
  const endpoint = `attribution_models/${id}`;

  const params = {
    ...options,
  };

  return ApiService.putRequest(endpoint, params);
};

const updateAttributionModelProperty = (organisationId, id, technicalName, params = {}) => {
  const endpoint = `attribution_models/${id}/properties/technical_name=${technicalName}`;
  return PluginService.handleSaveOfProperties(params, organisationId, 'attribution_models', id, endpoint);
};

export default {
  getAttributionModels,
  getAttributionModel,
  getAttributionModelProperties,
  createAttributionModel,
  updateAttributionModelProperty,
  updateAttributionModel,
  deleteAttributionModel,
};
