import ApiService from './ApiService.ts';

const getSites = (organisationId, datamartId, options = {}) => {
  const endpoint = `datamarts/${datamartId}/sites`;

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const getSite = (datamartId, siteId) => {
  const endpoint = `datamarts/${datamartId}/sites/${siteId}`;
  return ApiService.getRequest(endpoint);
};

const updateSite = (datamartId, siteId, body) => {
  const endpoint = `datamarts/${datamartId}/sites/${siteId}`;
  return ApiService.putRequest(endpoint, body);
};

const archiveSite = campaignId => {
  return updateSite(campaignId, { archived: true });
};

const createSite = (organisationId, datamartId, name, token) => {
  const endpoint = `datamarts/${datamartId}/sites`;

  const params = { organisation_id: organisationId };

  const body = {
    organisation_id: organisationId,
    name: name,
    token: token,
  };

  return ApiService.postRequest(endpoint, body, params);
};

export default {
  getSites,
  getSite,
  updateSite,
  archiveSite,
  createSite,
};
