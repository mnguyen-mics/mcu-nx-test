import lodash from 'lodash';
import moment from 'moment';

import LocalStorage from './LocalStorage';
import ApiService from './ApiService';
import log from '../utils/Logger';

const ACCESS_TOKEN = 'access_token';
const ACCESS_TOKEN_EXPIRATION_DATE = 'access_token_expiration_date';
const REFRESH_TOKEN = 'refresh_token';

const getAccessToken = () => {
  return LocalStorage.getItem(ACCESS_TOKEN);
};

const getAccessTokenExpirationDate = () => {
  const timestamp = LocalStorage.getItem(ACCESS_TOKEN_EXPIRATION_DATE);
  if (timestamp) return moment(timestamp, 'x');
  return moment(0);
};

const isAuthenticated = () => {
  const accessToken = getAccessToken();
  const expirationDate = getAccessTokenExpirationDate();
  const isAccessTokenNull = accessToken == null;
  const isAccessTokenExpired = moment().isAfter(expirationDate);
  if (isAccessTokenNull) {
    log.debug('Access token not found');
  } else if (isAccessTokenExpired) {
    log.debug('Access token expired');
  }
  return !(isAccessTokenNull || isAccessTokenExpired);
};

const getRefreshToken = () => {
  return LocalStorage.getItem(REFRESH_TOKEN);
};

const setAccessToken = (token) => {
  LocalStorage.setItem({
    [ACCESS_TOKEN]: token
  });
};

const setAccessTokenExpirationDate = (expireIn) => {
  let expirationDate = moment().add(1, 'hours');
  if (expireIn) expirationDate = moment().add(expireIn, 'seconds');
  LocalStorage.setItem({
    [ACCESS_TOKEN_EXPIRATION_DATE]: expirationDate.format('x')
  });
};

const setRefreshToken = (refreshToken) => {
  LocalStorage.setItem({
    [REFRESH_TOKEN]: refreshToken
  });
};

const deleteCredentials = () => {
  LocalStorage.removeItem(ACCESS_TOKEN);
  LocalStorage.removeItem(ACCESS_TOKEN_EXPIRATION_DATE);
  LocalStorage.removeItem(REFRESH_TOKEN);
};

const createAccessToken = (credentialsOrRefreshToken) => {
  const {
    email,
    password,
    refreshToken
  } = credentialsOrRefreshToken;

  const body = {
    refresh_token: refreshToken,
    email,
    password
  };

  const endpoint = 'authentication/access_tokens';

  return ApiService.postRequest(endpoint, body, null, null, { authenticated: false }).then((response) => {
    const data = response.data;
    return Object.keys(data).reduce((acc, key) => {
      const keyInCamelCase = lodash.camelCase(key);
      return {
        ...acc,
        [keyInCamelCase]: data[key]
      };
    }, {});
  });
};

const createRefreshToken = (credentials) => {
  const {
      email,
      password
  } = credentials;

  const body = {
    email,
    password
  };

  const endpoint = 'authentication/refresh_tokens';

  return ApiService.postRequest(endpoint, body, null, null, { authenticated: false }).then((response) => {
    return response.data.refresh_token;
  });
};

const getConnectedUser = () => {
  const endpoint = 'connected_user';

  return ApiService.getRequest(endpoint).then(res => res.data);
};

const sendPassword = (email) => {
  const endpoint = 'authentication/send_password_reset_email';

  const body = {
    email
  };

  return ApiService.postRequest(endpoint, body, null, null, { authenticated: false });
};

export default {
  getAccessToken,
  getAccessTokenExpirationDate,
  isAuthenticated,
  getRefreshToken,
  setAccessToken,
  setAccessTokenExpirationDate,
  setRefreshToken,
  createAccessToken,
  createRefreshToken,
  getConnectedUser,
  deleteCredentials,
  sendPassword
};
