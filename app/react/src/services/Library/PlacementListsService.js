import ApiService from '../ApiService.ts';

const getPlacementLists = (organisationId, options = {}) => {
  const endpoint = 'placement_lists';

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

export default {
  getPlacementLists,
};
