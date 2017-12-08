import ApiService from '../ApiService.ts';

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


const getPlacementList = (placementListId, options = {}) => {
  const endpoint = `placement_lists/${placementListId}`;

  const params = {
    ...options,
  };

  return ApiService.getRequest(endpoint, params).then(res => res.data);
};


export default {
  getPlacementLists,
  getPlacementList,
  deletePlacementList,
};
