import moment from 'moment';

import LocalStorage from './LocalStorage';
import ApiService, { DataResponse } from './ApiService';

import AccessTokenResource from '../models/directory/AccessTokenResource';
import RefreshTokenResource from '../models/directory/RefreshTokenResource';
import { UserProfileResource } from '../models/directory/UserProfileResource';

const ACCESS_TOKEN = 'access_token';
const ACCESS_TOKEN_EXPIRATION_DATE = 'access_token_expiration_date';
const REFRESH_TOKEN = 'refresh_token';
const REFRESH_TOKEN_EXPIRATION_DATE = 'refresh_token_expiration_date';
const REMEMBER_ME = 'remember_me';

// TODO To make AuthService injectable, we need to be able to do DI in sagas
// I found a way by looking at this repo: https://github.com/Neufund/platform-frontend/tree/master
// looking in redux-injectify.ts, sagasUtils.ts

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

const isTokenExpired = (token: moment.MomentInput) => {
  return moment().isAfter(token);
}

const isAuthenticated = () => {
  return !isTokenExpired(getAccessTokenExpirationDate());
};

const canAuthenticate = () => {
  return !isTokenExpired(getRefreshTokenExpirationDate());
}

const getRefreshToken = () => {
  return LocalStorage.getItem(REFRESH_TOKEN);
};

const getRememberMe = () => {
  return LocalStorage.getItem(REMEMBER_ME);
};


const setAccessToken = (token: string) => {
  LocalStorage.setItem({
    [ACCESS_TOKEN]: token,
  });
};

const setAccessTokenExpirationDate = (expireIn: number) => {
  let expirationDate = moment().add(1, 'hours');
  if (expireIn) expirationDate = moment().add(expireIn, 'seconds');
  LocalStorage.setItem({
    [ACCESS_TOKEN_EXPIRATION_DATE]: expirationDate.format('x'),
  });
};

const setRefreshToken = (refreshToken: string) => {
  LocalStorage.setItem({
    [REFRESH_TOKEN]: refreshToken,
  });
};

const setRememberMe = ({ rememberMe }: { rememberMe: boolean }) => {
  LocalStorage.setItem({
    [REMEMBER_ME]: rememberMe,
  });
};

const setRefreshTokenExpirationDate = (expireIn: number) => {
  let expirationDate = moment().add(expireIn, 'seconds');
  if (getRememberMe()) expirationDate = moment().add(7, 'days');
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

export interface Credentials {
  email: string;
  password: string;
};

export interface CredentialsOrRefreshToken extends Credentials {  
  refreshToken: string;
};

const createAccessToken = (credentialsOrRefreshToken: CredentialsOrRefreshToken) => {
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

  return ApiService.postRequest<DataResponse<AccessTokenResource>>(
    endpoint, 
    body, 
    {}, 
    {}, 
    { authenticated: false }
  );
};

const createRefreshToken = (credentials: Credentials) => {
  const {
    email,
    password,
  } = credentials;

  const body = {
    email,
    password,
  };

  const endpoint = 'authentication/refresh_tokens';

  return ApiService.postRequest<DataResponse<RefreshTokenResource>>(endpoint, body, {}, {}, { authenticated: false }).then((response) => {
    return response.data.refresh_token;
  });
};


const getConnectedUser = () => {
  const endpoint = 'connected_user';

  return ApiService.getRequest<DataResponse<UserProfileResource>>(endpoint).then(res => res.data);
};

const sendPassword = (email: string) => {
  const endpoint = 'authentication/send_password_reset_email';

  const body = {
    email,
  };

  return ApiService.postRequest(endpoint, body, {}, {}, { authenticated: false });
};

const resetPassword = (email: string, token: string, password: string) => {
  const endpoint = 'authentication/set_password';
  const body = {
    email,
    token,
    password
  };
  return ApiService.postRequest(endpoint, body, {}, {}, { authenticated: false });
};

export default {
  getAccessToken,
  getAccessTokenExpirationDate,
  isAuthenticated,
  canAuthenticate,
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
