import ApiService from './ApiService.ts';

function getAllPublishers(organisationId) {
  const endpoint = `display_network_accesses?organisation_id=${organisationId}`;
  return ApiService.getRequest(endpoint);
}

function getPublisher(displayNetworkId) {
  const endpoint = `display_networks/${displayNetworkId}`;
  return ApiService.getRequest(endpoint);
}

export default {
  getAllPublishers,
  getPublisher,
};
