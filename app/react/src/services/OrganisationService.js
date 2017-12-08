import ApiService from './ApiService.ts';

const getWorkspace = (organisationId) => {
  const endpoint = `organisations/${organisationId}/workspace`;


  return ApiService.getRequest(endpoint).then(res => res.data);
};

const getCookies = () => {
  const endpoint = 'my_cookies';
  return ApiService.getRequest(endpoint, {}, {}, { withCredentials: true }).then(res => res.data);
};

const getStandardLogo = () => {
  const endpoint = 'react/src/assets/images/logo.png';

  const headers = { Accept: 'image/png' };
  const options = {
    localUrl: true,
  };

  return ApiService.getRequest(endpoint, null, headers, options);
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
  getStandardLogo,
  getCookies,
  putLogo,
};
