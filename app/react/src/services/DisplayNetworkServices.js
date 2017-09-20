import ApiService from './ApiService';

function getAllPublishers(organisationId) {
  const endpoint = `display_network_accesses?organisation_id=${organisationId}`;
  return ApiService.getRequest(endpoint).then(res => res.data);
}

export default {
  getAllPublishers
};
