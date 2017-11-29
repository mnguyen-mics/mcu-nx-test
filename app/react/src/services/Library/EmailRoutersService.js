import ApiService from '../ApiService';
import PluginService from '../PluginService';

const getEmailRouters = (organisationId, options = {}) => {
  const endpoint = 'email_routers';

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const getEmailRouterProperty = (id, options = {}) => {
  const endpoint = `email_routers/${id}/properties`;

  return ApiService.getRequest(endpoint, options);
};

const getEmailRouter = (id, options = {}) => {
  const endpoint = `email_routers/${id}`;

  const params = {
    ...options,
  };
  return ApiService.getRequest(endpoint, params);
};

const deleteEmailRouter = (id, options = {}) => {
  const endpoint = `email_routers/${id}`;

  const params = {
    ...options,
  };
  return ApiService.deleteRequest(endpoint, params);
};

const createEmailRouter = (organisationId, options = {}) => {
  const endpoint = `email_routers?organisation_id=${organisationId}`;

  const params = {
    ...options,
  };

  return ApiService.postRequest(endpoint, params);
};

const updateEmailRouter = (id, options = {}) => {
  const endpoint = `email_routers/${id}`;

  const params = {
    ...options,
  };

  return ApiService.putRequest(endpoint, params);
};

const updateEmailRouterProperty = (organisationId, id, technicalName, params = {}) => {
  const endpoint = `email_routers/${id}/properties/technical_name=${technicalName}`;
  return PluginService.handleSaveOfProperties(params, organisationId, 'email_routers', id, endpoint);
};

export default {
  getEmailRouters,
  getEmailRouter,
  getEmailRouterProperty,
  updateEmailRouterProperty,
  updateEmailRouter,
  createEmailRouter,
  deleteEmailRouter,
};
