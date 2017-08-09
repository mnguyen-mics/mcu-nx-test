import ApiService from './ApiService';

const getMobileApplications = (organisationId, datamartId, options = {}) => {
  const endpoint = `datamarts/${datamartId}/mobile_applications`;

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const getMobileApplication = (datamartId, mobileApplicationsId) => {
  const endpoint = `datamarts/${datamartId}/mobile_applications/${mobileApplicationsId}`;
  return ApiService.getRequest(endpoint);
};

const updateMobileApplication = (datamartId, mobileApplicationsId, body) => {
  const endpoint = `datamarts/${datamartId}/mobile_applications/${mobileApplicationsId}`;
  return ApiService.putRequest(endpoint, body);
};

const archiveMobileApplication = campaignId => {
  return updateMobileApplication(campaignId, { archived: true });
};

const createMobileApplication = (organisationId, datamartId, name, token) => {
  const endpoint = `datamarts/${datamartId}/mobile_applications`;

  const params = { organisation_id: organisationId };

  const body = {
    organisation_id: organisationId,
    name: name,
    token: token,
  };

  return ApiService.postRequest(endpoint, body, params);
};

export default {
  getMobileApplications,
  getMobileApplication,
  updateMobileApplication,
  archiveMobileApplication,
  createMobileApplication,
};
