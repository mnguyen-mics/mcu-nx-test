import lodash from 'lodash';
import moment from 'moment';

import LocalStorage from './LocalStorage';
import ApiService from './ApiService.ts';
import log from '../utils/Logger';

const ACCESS_TOKEN = 'access_token';
const ACCESS_TOKEN_EXPIRATION_DATE = 'access_token_expiration_date';
const REFRESH_TOKEN = 'refresh_token';
const REFRESH_TOKEN_EXPIRATION_DATE = 'refresh_token_expiration_date';
const REMEMBER_ME = 'remember_me';

const getAccessToken = () => {
  return LocalStorage.getItem(ACCESS_TOKEN);
};

const getAccessTokenExpirationDate = () => {
  const timestamp = LocalStorage.getItem(ACCESS_TOKEN_EXPIRATION_DATE);
  if (timestamp) return moment(timestamp, 'x');
  return moment(0);
};

const getRefreshTokenExpirationDate = () => {
  const timestamp = LocalStorage.getItem(REFRESH_TOKEN_EXPIRATION_DATE);
  if (timestamp) return moment(timestamp, 'x');
  return moment(0);
};

const isAuthenticated = () => {
  const accessToken = getAccessToken();
  const refreshTokenExpirationDate = getRefreshTokenExpirationDate();
  const isAccessTokenNull = accessToken == null;
  const isRefreshTokenExpired = moment().isAfter(refreshTokenExpirationDate);
  if (isAccessTokenNull) {
    log.debug('Access token not found');
    return false;
  } else if (isRefreshTokenExpired) {
    log.debug('refresh token expired');
    return false;
  }
  return true;
};

const getRefreshToken = () => {
  return LocalStorage.getItem(REFRESH_TOKEN);
};

const getRememberMe = () => {
  return LocalStorage.getItem(REMEMBER_ME);
};


const setAccessToken = (token) => {
  LocalStorage.setItem({
    [ACCESS_TOKEN]: token,
  });
};

const setAccessTokenExpirationDate = (expireIn) => {
  let expirationDate = moment().add(1, 'hours');
  // let expirationDate = moment().add(2, 'seconds');
  if (expireIn) expirationDate = moment().add(expireIn, 'seconds');
  LocalStorage.setItem({
    [ACCESS_TOKEN_EXPIRATION_DATE]: expirationDate.format('x'),
  });
};

const setRefreshToken = (refreshToken) => {
  LocalStorage.setItem({
    [REFRESH_TOKEN]: refreshToken,
  });
};

const setRememberMe = ({ rememberMe }) => {
  LocalStorage.setItem({
    [REMEMBER_ME]: rememberMe,
  });
};

const setRefreshTokenExpirationDate = (expireIn) => {
  let expirationDate = moment().add(7, 'days');
  if (expireIn) expirationDate = moment().add(expireIn, 'seconds');
  LocalStorage.setItem({
    [REFRESH_TOKEN_EXPIRATION_DATE]: expirationDate.format('x'),
  });
};

const deleteCredentials = () => {
  LocalStorage.removeItem(ACCESS_TOKEN);
  LocalStorage.removeItem(ACCESS_TOKEN_EXPIRATION_DATE);
  LocalStorage.removeItem(REFRESH_TOKEN);
  LocalStorage.removeItem(REFRESH_TOKEN_EXPIRATION_DATE);
  LocalStorage.removeItem(REMEMBER_ME);
};

const createAccessToken = (credentialsOrRefreshToken) => {
  const {
    email,
    password,
    refreshToken,
  } = credentialsOrRefreshToken;

  const body = {
    refresh_token: refreshToken,
    email,
    password,
  };

  const endpoint = 'authentication/access_tokens';

  return ApiService.postRequest(endpoint, body, null, null, { authenticated: false }).then((response) => {
    const data = response.data;
    return Object.keys(data).reduce((acc, key) => {
      const keyInCamelCase = lodash.camelCase(key);
      return {
        ...acc,
        [keyInCamelCase]: data[key],
      };
    }, {});
  });
};

const createRefreshToken = (credentials) => {
  const {
    email,
    password,
  } = credentials;

  const body = {
    email,
    password,
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
    email,
  };

  return ApiService.postRequest(endpoint, body, null, null, { authenticated: false });
};

const resetPassword = (email, token, password) => {
  const endpoint = 'authentication/set_password';
  const body = {
    email,
    token,
    password
  };
  return ApiService.postRequest(endpoint, body, null, null, { authenticated: false });
};

export default {
  getAccessToken,
  getAccessTokenExpirationDate,
  isAuthenticated,
  getRefreshToken,
  getRefreshTokenExpirationDate,
  setAccessToken,
  setAccessTokenExpirationDate,
  setRefreshToken,
  setRefreshTokenExpirationDate,
  createAccessToken,
  createRefreshToken,
  getRememberMe,
  setRememberMe,
  getConnectedUser,
  deleteCredentials,
  sendPassword,
  resetPassword
};
