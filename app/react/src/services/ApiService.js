import 'whatwg-fetch';

import AuthService from './AuthService';

const MCS_CONSTANTS = window.MCS_CONSTANTS || {}; // eslint-disable-line no-undef
const LOCAL_URL = '/';
const API_URL = `${MCS_CONSTANTS.API_URL}/v1/`;
const ADMIN_API_URL = `${MCS_CONSTANTS.ADMIN_API_URL}/v1/`;

const request = (method, endpoint, params = {}, body, authenticated = true, options = {}) => {

  const paramsToQueryString = (paramsArg) => {
    const paramsToArray = Object.keys(paramsArg);
    const str = paramsToArray.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(paramsArg[key])}`).join('&');
    return str.length ? `?${str}` : '';
  };

  let url = options.adminApi ? ADMIN_API_URL : options.localUrl ? LOCAL_URL : API_URL;
  url = `${url}${endpoint}${paramsToQueryString(params)}`;

  const token = AuthService.getToken();

  const config = {
    method
  };

  if (authenticated) {
    if (token) {
      config.headers = {
        Authorization: token
      };
    } else {
      throw new Error('Error. Authenticated without token');
    }
  }

  if (body) {
    config.headers = Object.assign({}, config.headers, {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    });
    config.body = JSON.stringify(body);
  }

  const parseJson = (response) => {
    return response.json()
            .then(json => ({ json, response }));
  };

  const checkStatus = ({ json, response }) => {
    if (!response.ok) {
      return Promise.reject(json);
    }
    return Object.assign({}, json);
  };

  return fetch(url, config) // eslint-disable-line no-undef
        .then(parseJson)
        .then(checkStatus)
        .catch(response => {
          const error = response.error ? response : { error: 'UNKNOWN_ERROR' };
          throw error;
        });
};

const getRequest = (endpoint, params = {}, options = {}) => {
  const authenticated = options.authenticated || true;
  return request('get', endpoint, params, null, authenticated, options);
};

const postRequest = (endpoint, body, params = {}, options = {}) => {
  const authenticated = options.authenticated || true;
  return request('post', endpoint, params, body, authenticated, options);
};

const putRequest = (endpoint, body, params = {}, options = {}) => {
  const authenticated = options.authenticated || true;
  return request('put', endpoint, params, body, authenticated, options);
};

const deleteRequest = (endpoint, params = {}, options = {}) => {
  const authenticated = options.authenticated || true;
  return request('delete', endpoint, params, null, authenticated, options);
};

export default {
  request,

  getRequest,
  postRequest,
  putRequest,
  deleteRequest
};
