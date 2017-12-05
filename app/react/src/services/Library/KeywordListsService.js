import ApiService from '../ApiService.ts';

const getKeywordLists = (organisationId, options = {}) => {
  const endpoint = 'keyword_lists';

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

export default {
  getKeywordLists,
};
