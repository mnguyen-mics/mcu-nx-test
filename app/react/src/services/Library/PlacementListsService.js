import ApiService from '../ApiService';

const getPlacementLists = (organisationId, options = {}) => {
  const endpoint = 'placement_lists';

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const deletePlacementList = (id, options = {}) => {
  const endpoint = `placement_lists/${id}`;
  return ApiService.deleteRequest(endpoint, options);
};

export default {
  getPlacementLists,
  deletePlacementList,
};
