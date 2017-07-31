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

const getEmailCampaign = campaignId => {
  const endpoint = `email_campaigns/${campaignId}`;
  return ApiService.getRequest(endpoint).then(res => res.data);
};

const updateEmailCampaign = (campaignId, campaignResource) => {
  const endpoint = `email_campaigns/${campaignId}`;
  return ApiService.putRequest(endpoint, campaignResource);
};

const archiveEmailCampaign = campaignId => {
  return updateEmailCampaign(campaignId, { archived: true });
};

const createEmailCampaign = (organisationId, campaignResource) => {
  const endpoint = 'email_campaigns';

  const params = { organisation_id: organisationId };

  const body = {
    ...campaignResource,
    organisation_id: organisationId,
    type: 'EMAIL',
    editor_version_id: '17',
  };

  return ApiService.postRequest(endpoint, body, params).then(res => res.data);
};

const getEmailRouters = campaignId => {
  const endpoint = `email_campaigns/${campaignId}/email_routers`;
  return ApiService.getRequest(endpoint);
};

const updateEmailRouter = (campaignId, emailRouterId, emailRouterResource) => {
  const endpoint = `email_campaigns/${campaignId}/email_routers/${emailRouterId}`;
  return ApiService.putRequest(endpoint, emailRouterResource).then(res => res.data);
};

const updateEmailBlastTemplate = (campaignId, blastId, emailTemplateId, emailTemplateResource) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}/email_templates/${emailTemplateId}`;
  return ApiService.putRequest(endpoint, emailTemplateResource).then(res => res.data);
};

const updateEmailBlastConsent = (campaignId, blastId, consentId, emailConsentResource) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}/email_consents/${consentId}`;
  return ApiService.putRequest(endpoint, emailConsentResource).then(res => res.data);
};


const createEmailRouter = (campaignId, emailRouterResource) => {
  const endpoint = `email_campaigns/${campaignId}/email_routers`;
  return ApiService.postRequest(endpoint, emailRouterResource).then(res => res.data);
};

const getEmailBlasts = campaignId => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts`;
  return ApiService.getRequest(endpoint);
};

const createEmailBlast = (campaignId, blastResource) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts`;
  return ApiService.postRequest(endpoint, blastResource).then(res => res.data);
};

const updateEmailBlast = (campaignId, blastId, blastResource) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}`;
  return ApiService.putRequest(endpoint, blastResource).then(res => res.data);
};

const deleteEmailBlast = (campaignId, blastId) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}`;
  return ApiService.deleteRequest(endpoint);
};

const getEmailBlastTemplates = (campaignId, blastId) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}/email_templates`;
  return ApiService.getRequest(endpoint);
};

const createEmailBlastTemplate = (campaignId, blastId, templateResource) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}/email_templates`;
  return ApiService.postRequest(endpoint, templateResource).then(res => res.data);
};

const getEmailBlastConsents = (campaignId, blastId) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}/email_consents`;
  return ApiService.getRequest(endpoint);
};

const createEmailBlastConsent = (campaignId, blastId, consentResource) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}/email_consents`;
  return ApiService.postRequest(endpoint, consentResource).then(res => res.data);
};

const getBlastSegments = (campaignId, blastId) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}/audience_segments`;
  return ApiService.getRequest(endpoint);
};

const updateBlastSegments = (campaignId, blastId, segmentId, segmentResource) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}/email_consents`;
  return ApiService.getRequest(endpoint);
};

const createBlastSegment = (campaignId, blastId, segmentResource) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}/email_consents`;
  return ApiService.getRequest(endpoint);
};

const deleteBlastSegment = (campaignId, blastId, segmentId) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}/email_consents`;
  return ApiService.getRequest(endpoint);
};

export default {
  getCampaigns,
  getEmailCampaign,
  getEmailRouters,
  getEmailBlasts,
  getEmailBlastTemplates,
  getEmailBlastConsents,
  getBlastSegments,

  createEmailCampaign,
  createEmailRouter,
  createEmailBlast,
  createEmailBlastConsent,
  createEmailBlastTemplate,
  createBlastSegment,

  archiveEmailCampaign,
  updateEmailCampaign,
  updateEmailRouter,
  updateEmailBlast,
  updateEmailBlastConsent,
  updateEmailBlastTemplate,
  updateBlastSegments,

  deleteEmailBlast,
  deleteBlastSegment
};
