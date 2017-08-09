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

const putLogo = (organisationId, formData) => {
  const endpoint = `organisations/${organisationId}/logo`;
  return ApiService.putRequest(endpoint, formData);
};

export default {
  getWorkspace,
  getLogo,
  putLogo,
};
