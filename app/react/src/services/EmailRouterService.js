import ApiService from './ApiService.ts';

const getRouters = (organisationId, options = {}) => {
  const endpoint = 'email_routers';

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

export default {
  getRouters,
};
