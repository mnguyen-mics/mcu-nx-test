import ApiService from './ApiService';

const getVersion = () => {
  const endpoint = 'version.json';
  const params = {};
  const options = {
    localUrl: true,
  };
  return ApiService.getRequest(endpoint, params, null, options);
};

const isAdBlockOn = () => {
  const endpoint = 'angular/src/core/adblock/display-ads/beacon.html';
  const params = {};
  const options = {
    localUrl: true,
  };

  return ApiService.getRequest(endpoint, params, null, options);
};


export default {
  getVersion,
  isAdBlockOn,
};
