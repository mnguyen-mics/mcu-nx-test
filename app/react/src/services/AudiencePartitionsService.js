import ApiService from './ApiService.ts';

const getPartitions = (organisationId, datamartId, options = {}) => {
  const endpoint = 'audience_partitions';

  const params = {
    organisation_id: organisationId,
    datamart_id: datamartId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

export default {
  getPartitions,
};
