import ApiService from '../ApiService';

const getCreativeDisplay = (organisationId, options = {}) => {
  const endpoint = 'creatives';

  const params = {
    organisation_id: organisationId,
    ...options
  };

  return ApiService.getRequest(endpoint, params);
};


export default {
  getCreativeDisplay,
};
