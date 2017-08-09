import 'whatwg-fetch';
import { isEmpty } from 'lodash';

import AuthService from './AuthService';

const MCS_CONSTANTS = window.MCS_CONSTANTS || {}; // eslint-disable-line no-undef
const LOCAL_URL = '/';
const API_URL = `${MCS_CONSTANTS.API_URL}/v1/`;
const ADMIN_API_URL = `${MCS_CONSTANTS.ADMIN_API_URL}/v1/`;

const request = (method, endpoint, params, headers, body, authenticated = true, options = {}) => {

  const paramsToQueryString = (paramsArg) => {
    if (!paramsArg) return '';
    const paramsToArray = Object.keys(paramsArg);
    const str = paramsToArray.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(paramsArg[key])}`).join('&');
    return str.length ? `?${str}` : '';
  };

  let url = options.adminApi ? ADMIN_API_URL : options.localUrl ? LOCAL_URL : API_URL;
  url = `${url}${endpoint}${paramsToQueryString(params)}`;

  const token = AuthService.getAccessToken();

  const config = {
    method,
  };

  if (!options.localUrl && authenticated) {
    if (token) {
      config.headers = {
        Authorization: token,
      };
    } else {
      throw new Error(`Error. Authenticated without token, endpoint:${endpoint}`);
    }
  }

  const bodyIsFormData = (body instanceof FormData); /* global FormData */

  if (headers && !isEmpty(headers)) {
    config.headers = Object.assign({}, config.headers, headers);
  } else if (!bodyIsFormData) {
    config.headers = Object.assign({}, config.headers, {
      'Accept': 'application/json', // eslint-disable-line
      'Content-Type': 'application/json',
    });
  }

  if (bodyIsFormData) {
    config.body = body; // body passed as a formdata object
  } else if (body) {
    config.body = JSON.stringify(body);
  }

  const checkAndParse = response => {
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.indexOf('image/png') !== -1) {
      return response.blob().then(blob => {
        if (!response.ok) {
          Promise.reject(blob);
        }

        return blob;
      });
    }

    // Considered as a json response by default
    return response.json().then(json => {
      if (!response.ok) {
        return Promise.reject(json);
      }

      return json;
    });

  };

  return fetch(url, config) // eslint-disable-line no-undef
    .then(checkAndParse);
};

const getRequest = (endpoint, params = {}, headers = {}, options = {}) => {
  const authenticated = options.authenticated !== undefined ? options.authenticated : true;
  return request('get', endpoint, params, headers, null, authenticated, options);
};

const postRequest = (endpoint, body, params = {}, headers = {}, options = {}) => {
  const authenticated = options.authenticated !== undefined ? options.authenticated : true;
  return request('post', endpoint, params, headers, body, authenticated, options);
};

const putRequest = (endpoint, body, params = {}, headers, options = {}) => {
  const authenticated = options.authenticated !== undefined ? options.authenticated : true;
  return request('put', endpoint, params, headers, body, authenticated, options);
};

const deleteRequest = (endpoint, params = {}, headers = {}, options = {}) => {
  const authenticated = options.authenticated !== undefined ? options.authenticated : true;
  return request('delete', endpoint, params, headers, null, authenticated, options);
};

export default {
  request,
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
};
