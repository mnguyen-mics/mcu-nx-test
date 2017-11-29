import ApiService from '../ApiService';

const getKeywordLists = (organisationId, options = {}) => {
  const endpoint = 'keyword_lists';

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const deleteKeywordLists = (id, options = {}) => {
  const endpoint = `keyword_lists/${id}`;
  return ApiService.deleteRequest(endpoint, options);
};

export default {
  getKeywordLists,
  deleteKeywordLists,
};
