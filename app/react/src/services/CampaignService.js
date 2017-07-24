import ApiService from './ApiService';


const getCampaigns = (organisationId, campaignType, options = {}) => {
  const endpoint = 'campaigns';

  const params = {
    organisation_id: organisationId,
    campaign_type: campaignType,
    ...options
  };

  return ApiService.getRequest(endpoint, params);
};

const getEmailCampaign = (campaignId) => {
  const endpoint = `email_campaigns/${campaignId}`;
  return ApiService.getRequest(endpoint);
};

const updateEmailCampaign = (campaignId, body) => {
  const endpoint = `email_campaigns/${campaignId}`;
  return ApiService.putRequest(endpoint, body);
};

const archiveEmailCampaign = campaignId => {
  return updateEmailCampaign(campaignId, { archived: true });
};

const createEmailCampaign = (organisationId, name, technicalName) => {
  const endpoint = 'email_campaigns';

  const params = { organisation_id: organisationId };

  const body = {
    organisation_id: organisationId,
    type: 'EMAIL',
    editor_version_id: 17,
    name,
    technical_name: technicalName
  };

  return ApiService.postRequest(endpoint, body, params);
};

const getEmailRouters = (campaignId) => {
  const endpoint = `email_campaigns/${campaignId}/email_routers`;
  return ApiService.getRequest(endpoint);
};

const createEmailRouters = (campaignId, emailRouterId) => {
  const endpoint = `email_campaigns/${campaignId}/email_routers`;

  const body = {
    email_router_id: emailRouterId
  };

  return ApiService.postRequest(endpoint, body);
};

const getEmailBlasts = (campaignId) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts`;
  return ApiService.getRequest(endpoint);
};

export default {
  getCampaigns,
  getEmailCampaign,
  updateEmailCampaign,
  archiveEmailCampaign,
  createEmailCampaign,
  getEmailRouters,
  createEmailRouters,
  getEmailBlasts
};
