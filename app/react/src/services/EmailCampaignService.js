import ApiService from './ApiService';

const getEmailCampaign = campaignId => {
  const endpoint = `email_campaigns/${campaignId}`;
  return ApiService.getRequest(endpoint).then(res => res.data);
};

const getRouters = campaignId => {
  const endpoint = `email_campaigns/${campaignId}/email_routers`;
  return ApiService.getRequest(endpoint);
};

const getBlasts = campaignId => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts`;
  return ApiService.getRequest(endpoint);
};

const getBlast = (campaignId, blastId) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}`;
  return ApiService.getRequest(endpoint).then(res => res.data);
};

const getEmailTemplates = (campaignId, blastId) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}/email_templates`;
  return ApiService.getRequest(endpoint);
};

const getConsents = (campaignId, blastId) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}/email_consents`;
  return ApiService.getRequest(endpoint);
};

const getSegments = (campaignId, blastId) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}/audience_segments`;
  return ApiService.getRequest(endpoint);
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

const createBlast = (campaignId, blastResource) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts`;
  return ApiService.postRequest(endpoint, blastResource).then(res => res.data);
};

const addRouter = (campaignId, emailRouterResource) => {
  const endpoint = `email_campaigns/${campaignId}/email_routers`;
  return ApiService.postRequest(endpoint, emailRouterResource).then(res => res.data);
};

const addConsent = (campaignId, blastId, consentResource) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}/email_consents`;
  return ApiService.postRequest(endpoint, consentResource).then(res => res.data);
};

const addEmailTemplate = (campaignId, blastId, templateResource) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}/email_templates`;
  return ApiService.postRequest(endpoint, templateResource).then(res => res.data);
};

const addSegment = (campaignId, blastId, segmentResource) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}/audience_segments`;
  return ApiService.postRequest(endpoint, segmentResource).then(res => res.data);
};


const updateEmailCampaign = (campaignId, campaignResource) => {
  const endpoint = `email_campaigns/${campaignId}`;
  return ApiService.putRequest(endpoint, campaignResource);
};

const archiveEmailCampaign = campaignId => {
  return updateEmailCampaign(campaignId, { archived: true });
};

const updateBlast = (campaignId, blastId, blastResource) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}`;
  return ApiService.putRequest(endpoint, blastResource).then(res => res.data);
};

const deleteBlast = (campaignId, blastId) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}`;
  return ApiService.deleteRequest(endpoint);
};

const removeRouter = (campaignId, routerId) => {
  const endpoint = `email_campaigns/${campaignId}/email_routers/${routerId}`;
  return ApiService.deleteRequest(endpoint);
};

const removeConsent = (campaignId, blastId, consentId) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}/email_consents/${consentId}`;
  return ApiService.deleteRequest(endpoint);
};

const removeEmailTemplate = (campaignId, blastId, emailTemplateId) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}/email_templates/${emailTemplateId}`;
  return ApiService.deleteRequest(endpoint);
};

const removeSegment = (campaignId, blastId, segmentId) => {
  const endpoint = `email_campaigns/${campaignId}/email_blasts/${blastId}/audience_segments/${segmentId}`;
  return ApiService.deleteRequest(endpoint);
};

export default {
  getEmailCampaign,
  getRouters,
  getBlasts,
  getBlast,
  getEmailTemplates,
  getConsents,
  getSegments,

  createEmailCampaign,
  createBlast,
  addRouter,
  addConsent,
  addEmailTemplate,
  addSegment,

  updateEmailCampaign,
  archiveEmailCampaign,
  updateBlast,

  deleteBlast,
  removeRouter,
  removeConsent,
  removeEmailTemplate,
  removeSegment,
};
