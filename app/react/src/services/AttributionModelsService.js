import ApiService from './ApiService';

const getAttributionModels = (organisationId, options = {}) => {
  const endpoint = 'attribution_models';

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const createAttributionModels = (organisationId, options = {}) => {
  const endpoint = `attribution_models?organisation_id=${organisationId}`;

  const params = {
    ...options,
  };

  return ApiService.postRequest(endpoint, params);
};

const updateAttributionModelProperty = (attributionModelId, technicalName, value) => {
  const endpoint = `attribution_models/${attributionModelId}/properties/technical_name=${technicalName}`;
  const body = {
    deletable: false,
    origin: 'PLUGIN',
    property_type: 'INT',
    technical_name: technicalName,
    value: { value: value },
    writable: true,
  };
  return ApiService.putRequest(endpoint, body);
};

export default {
  getAttributionModels,
  createAttributionModels,
  updateAttributionModelProperty,
};
