import ApiService from './ApiService';

const getCreatives = (organisationId, options = {}) => {
  const endpoint = 'creatives';

  const params = {
    organisation_id: organisationId,
    ...options,
  };
  return ApiService.getRequest(endpoint, params);
};

const getCreative = creativeId => {
  const endpoint = `creatives/${creativeId}`;
  return ApiService.getRequest(endpoint).then(res => res.data);
};

const getDisplayAds = (organisationId, options = {}) => {
  return getCreatives(organisationId, { creative_type: 'DISPLAY_AD', ...options });
};

const getEmailTemplates = (organisationId, options = {}) => {
  return getCreatives(organisationId, { creative_type: 'EMAIL_TEMPLATE', ...options });
};

const getEmailTemplate = templateId => {
  return getCreative(templateId);
};

const getCreativeScreenshotStatus = creativeId => {
  const endpoint = `creatives/${creativeId}/screenshots/last`;
  return ApiService.getRequest(endpoint);
};


export default {
  getCreatives,
  getCreative,
  getDisplayAds,
  getEmailTemplates,
  getEmailTemplate,
  getCreativeScreenshotStatus,
};
