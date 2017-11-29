import ApiService from '../ApiService';
import PluginService from '../PluginService';

const getBidOptimizers = (organisationId, options = {}) => {
  const endpoint = 'bid_optimizers';

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const deleteBidOptimizer = (id, options = {}) => {
  const endpoint = `bid_optimizers/${id}`;

  return ApiService.deleteRequest(endpoint, options);
};

const getBidOptimizerProperty = (id, options = {}) => {
  const endpoint = `bid_optimizers/${id}/properties`;

  return ApiService.getRequest(endpoint, options);
};

// OLD WAY AND DUMB WAY TO DO IT, TO CHANGE
const getBidOptimizerProperties = (id, options = {}) => {
  const endpoint = `bid_optimizers/${id}/properties`;

  return ApiService.getRequest(endpoint, options).then(res => { return { ...res.data, id }; });
};

const getBidOptimizer = (id, options = {}) => {
  const endpoint = `bid_optimizers/${id}`;

  const params = {
    ...options,
  };
  return ApiService.getRequest(endpoint, params);
};

const createBidOptimizer = (organisationId, options = {}) => {
  const endpoint = `bid_optimizers?organisation_id=${organisationId}`;

  const params = {
    ...options,
  };

  return ApiService.postRequest(endpoint, params);
};

const updateBidOptimizer = (id, options = {}) => {
  const endpoint = `bid_optimizers/${id}`;

  const params = {
    ...options,
  };

  return ApiService.putRequest(endpoint, params);
};

const updateBidOptimizerProperty = (organisationId, id, technicalName, params = {}) => {
  const endpoint = `bid_optimizers/${id}/properties/technical_name=${technicalName}`;
  return PluginService.handleSaveOfProperties(params, organisationId, 'bid_optimizers', id, endpoint);
};

export default {
  getBidOptimizers,
  getBidOptimizer,
  getBidOptimizerProperty,
  createBidOptimizer,
  updateBidOptimizer,
  getBidOptimizerProperties,
  updateBidOptimizerProperty,
  deleteBidOptimizer,
};
