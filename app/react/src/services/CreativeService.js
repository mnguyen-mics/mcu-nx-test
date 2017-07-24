import ApiService from './ApiService';

const getCreatives = (organisationId, options = {}) => {
  const endpoint = 'creatives';

  const params = {
    organisation_id: organisationId,
    ...options
  };

  return ApiService.getRequest(endpoint, params);
};

const getDisplayAds = (organisationId, options = {}) => {
  return getCreatives(organisationId, { creative_type: 'DISPLAY_AD', ...options });
};

const getEmailTemplates = (organisationId, options = {}) => {
  return getCreatives(organisationId, { creative_type: 'EMAIL_TEMPLATE', ...options });
};


export default {
  getCreatives,
  getDisplayAds,
  getEmailTemplates
};
