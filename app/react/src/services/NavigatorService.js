import ApiService from './ApiService';

const getVersion = () => {
  const endpoint = 'version.json';
  const params = {};
  const options = {
    localUrl: true
  };
  return ApiService.getRequest(endpoint, params, options);
};

export default {
  getVersion
};
