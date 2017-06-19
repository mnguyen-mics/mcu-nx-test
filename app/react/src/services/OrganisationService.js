import ApiService from './ApiService';

const getWorkspace = (organisationId) => {
  const endpoint = `organisations/${organisationId}/workspace`;


  return ApiService.getRequest(endpoint).then(res => res.data);
};

const getLogo = (organisationId) => {
  const endpoint = `organisations/${organisationId}/logo`;

  const headers = { Accept: 'image/png' };

  return ApiService.getRequest(endpoint, null, headers);
};

export default {
  getWorkspace,
  getLogo
};
