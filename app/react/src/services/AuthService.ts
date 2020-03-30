import moment from 'moment';
import LocalStorage from './LocalStorage';
import ApiService, { DataResponse } from './ApiService';
import AccessTokenResource from '../models/directory/AccessTokenResource';
import RefreshTokenResource from '../models/directory/RefreshTokenResource';
import { UserProfileResource } from '../models/directory/UserProfileResource';
import { injectable } from 'inversify';

export const ACCESS_TOKEN = 'access_token';
const ACCESS_TOKEN_EXPIRATION_DATE = 'access_token_expiration_date';
const REFRESH_TOKEN = 'refresh_token';
const REFRESH_TOKEN_EXPIRATION_DATE = 'refresh_token_expiration_date';
const REMEMBER_ME = 'remember_me';

export interface Credentials {
  email: string;
  password: string;
}

export interface CredentialsOrRefreshToken extends Credentials {
  refreshToken: string;
}

export interface IAuthService {
  getAccessToken: () => string | undefined;

  getAccessTokenExpirationDate: () => moment.Moment;

  getRefreshTokenExpirationDate: () => moment.Moment;

  tokenExpiresIn: (tokenExpirationDate: moment.MomentInput) => number;

  isTokenExpired: (token: moment.MomentInput) => boolean;

  isAuthenticated: () => boolean;

  canAuthenticate: () => boolean;

  getRefreshToken: () => string | undefined;

  revokeRefreshToken: () => Promise<any>;

  getRememberMe: () => string | undefined;

  setAccessToken: (token: string) => void;

  setAccessTokenExpirationDate: (expireIn: number) => void;

  setRefreshToken: (refreshToken: string) => void;

  setRememberMe: (rememberMe: boolean) => void;

  setRefreshTokenExpirationDate: (expireIn: number) => void;

  deleteCredentials: () => void;

  createAccessToken: (
    credentialsOrRefreshToken: CredentialsOrRefreshToken,
  ) => Promise<DataResponse<AccessTokenResource>>;

  createRefreshToken: (credentials: Credentials) => Promise<string>;

  getConnectedUser: () => Promise<UserProfileResource>;

  sendPassword: (email: string) => Promise<any>;

  resetPassword: (
    email: string,
    token: string,
    password: string,
  ) => Promise<any>;
}

@injectable()
export class AuthService implements IAuthService {
  getAccessToken = () => {
    return LocalStorage.getItem(ACCESS_TOKEN);
  };

  getAccessTokenExpirationDate = () => {
    const timestamp = LocalStorage.getItem(ACCESS_TOKEN_EXPIRATION_DATE);
    if (timestamp) return moment(timestamp, 'x');
    return moment(0);
  };

  getRefreshTokenExpirationDate = () => {
    const timestamp = LocalStorage.getItem(REFRESH_TOKEN_EXPIRATION_DATE);
    if (timestamp) return moment(timestamp, 'x');
    return moment(0);
  };

  tokenExpiresIn = (tokenExpirationDate: moment.MomentInput) => {
    return moment(tokenExpirationDate)
      .subtract('10', 'minutes')
      .diff(moment(), 'ms');
  };

  isTokenExpired = (token: moment.MomentInput) => {
    return moment().isAfter(token);
  };

  isAuthenticated = () => {
    return !this.isTokenExpired(this.getAccessTokenExpirationDate());
  };

  canAuthenticate = () => {
    return !this.isTokenExpired(this.getRefreshTokenExpirationDate());
  };

  getRefreshToken = () => {
    return LocalStorage.getItem(REFRESH_TOKEN);
  };

  revokeRefreshToken = () => {
    const refreshToken = LocalStorage.getItem(REFRESH_TOKEN);

    if (refreshToken) {
      const body = {
        refresh_token: refreshToken,
      };

      const endpoint = 'authentication/refresh_token/revoke';

      return ApiService.postRequest(endpoint, body);
    }
    return Promise.resolve();
  };

  getRememberMe = () => {
    return LocalStorage.getItem(REMEMBER_ME);
  };

  setAccessToken = (token: string) => {
    LocalStorage.setItem({
      [ACCESS_TOKEN]: token,
    });
  };

  setAccessTokenExpirationDate = (expireIn: number) => {
    let expirationDate = moment().add(1, 'hours');
    if (expireIn) expirationDate = moment().add(expireIn, 'seconds');
    LocalStorage.setItem({
      [ACCESS_TOKEN_EXPIRATION_DATE]: expirationDate.format('x'),
    });
  };

  setRefreshToken = (refreshToken: string) => {
    LocalStorage.setItem({
      [REFRESH_TOKEN]: refreshToken,
    });
  };

  setIsLogged = (isLogged: boolean) => {
    LocalStorage.setItem({
      isLogged: String(isLogged),
    });
  };

  setRememberMe = (rememberMe: boolean) => {
    LocalStorage.setItem({
      [REMEMBER_ME]: String(rememberMe),
    });
  };

  setRefreshTokenExpirationDate = (expireIn: number) => {
    let expirationDate = moment().add(expireIn, 'seconds');
    if (this.getRememberMe()) expirationDate = moment().add(7, 'days');
    LocalStorage.setItem({
      [REFRESH_TOKEN_EXPIRATION_DATE]: expirationDate.format('x'),
    });
  };

  deleteCredentials = () => {
    LocalStorage.removeItem(ACCESS_TOKEN);
    LocalStorage.removeItem(ACCESS_TOKEN_EXPIRATION_DATE);
    LocalStorage.removeItem(REFRESH_TOKEN);
    LocalStorage.removeItem(REFRESH_TOKEN_EXPIRATION_DATE);
  };

  createAccessToken = (
    credentialsOrRefreshToken: CredentialsOrRefreshToken,
  ) => {
    const { email, password, refreshToken } = credentialsOrRefreshToken;

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
      { authenticated: false },
    );
  };

  createRefreshToken = (credentials: Credentials) => {
    const { email, password } = credentials;

    const body = {
      email,
      password,
    };

    const endpoint = 'authentication/refresh_tokens';

    return ApiService.postRequest<DataResponse<RefreshTokenResource>>(
      endpoint,
      body,
      {},
      {},
      { authenticated: false },
    ).then(response => {
      return response.data.refresh_token;
    });
  };

  getConnectedUser = () => {
    const endpoint = 'connected_user';

    return ApiService.getRequest<DataResponse<UserProfileResource>>(
      endpoint,
    ).then(res => res.data);
  };

  sendPassword = (email: string) => {
    const endpoint = 'authentication/send_password_reset_email';

    const body = {
      email,
    };

    return ApiService.postRequest(
      endpoint,
      body,
      {},
      {},
      { authenticated: false },
    );
  };

  resetPassword = (email: string, token: string, password: string) => {
    const endpoint = 'authentication/set_password';
    const body = {
      email,
      token,
      password,
    };
    return ApiService.postRequest(
      endpoint,
      body,
      {},
      {},
      { authenticated: false },
    );
  };
}
