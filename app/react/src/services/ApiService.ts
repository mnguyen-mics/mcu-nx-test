import 'whatwg-fetch';
import { isEmpty } from 'lodash';

import AuthService from './AuthService';

export type StatusCode = 'ok' | 'error';

interface ApiResponse {
  status: StatusCode;
}

export interface DataResponse<T> extends ApiResponse {
  data: T;
}

export interface DataListResponse<T> extends ApiResponse {
  data: T[];
  count: number;
  first_result?: number;
  max_results?: number;
  total?: number;
}

interface ApiOptions {
  localUrl?: string;
  adminApi?: object;
  withCredentials?: boolean;
  authenticated?: boolean;
}

export interface CancelablePromise<T> {
  promise: Promise<T>;
  cancel: () => void;
}

const MCS_CONSTANTS = (window as any).MCS_CONSTANTS || {}; // eslint-disable-line no-undef
const LOCAL_URL = '/';
const API_URL = `${MCS_CONSTANTS.API_URL}/v1/`;
const ADMIN_API_URL = `${MCS_CONSTANTS.ADMIN_API_URL}/v1/`;

type RequestMethod = 'get' | 'post' | 'put' | 'delete';

function request(
  method: RequestMethod,
  endpoint: string,
  params: object,
  headers: any,
  body: any,
  authenticated: boolean = true,
  options: ApiOptions = {},
) {
  const paramsToQueryString = (paramsArg: { [key: string]: any }) => {
    if (!paramsArg) return '';
    const paramsToArray: string[] = Object.keys(paramsArg);
    const str: string = paramsToArray
      .filter(key => paramsArg[key] !== undefined)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(paramsArg[key])}`)
      .join('&');
    return str.length ? `?${str}` : '';
  };

  let url = options.adminApi ? ADMIN_API_URL : options.localUrl ? LOCAL_URL : API_URL;
  url = `${url}${endpoint}${paramsToQueryString(params)}`;

  const token = AuthService.getAccessToken();

  const config: any = {
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
    config.headers = {...config.headers, ...headers};
  } else if (!bodyIsFormData) {
    config.headers = {...config.headers,
                      'Accept': 'application/json', // eslint-disable-line
                      'Content-Type': 'application/json'};
  }

  if (options.withCredentials) {
    config.credentials = 'include';
  }
  config.headers['X-Requested-By'] = 'mediarithmics-navigator';

  if (bodyIsFormData) {
    config.body = body; // body passed as a formdata object
  } else if (body) {
    config.body = JSON.stringify(body);
  }

  const checkAndParse = (response: Response) => {

    const contentType = response.headers.get('Content-Type');

    if (contentType && contentType.indexOf('image/png') !== -1) {
      return response.blob().then(blob => {
        if (!response.ok) {
          Promise.reject(blob);
        }
        return blob;
      });
    } else if (contentType && contentType.indexOf('text/html') !== -1) {
      return (response.status < 400
        ? Promise.resolve()
        : Promise.reject(response)
      );
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
}

function getRequest<T>(
  endpoint: string,
  params: object = {},
  headers: any = {},
  options: ApiOptions = {},
): Promise<T> {
  const authenticated = options.authenticated !== undefined ? options.authenticated : true;
  return request('get', endpoint, params, headers, null, authenticated, options) as Promise<T>;
}

function postRequest<T>(
  endpoint: string,
  body: object,
  params: object = {},
  headers: any = {},
  options: ApiOptions = {},
): Promise<T> {
  const authenticated = options.authenticated !== undefined ? options.authenticated : true;
  return request('post', endpoint, params, headers, body, authenticated, options) as Promise<T>;
}

function putRequest<T>(
  endpoint: string,
  body: object,
  params: object = {},
  headers: any = {},
  options: ApiOptions = {},
): Promise<T> {
  const authenticated = options.authenticated !== undefined ? options.authenticated : true;
  return request('put', endpoint, params, headers, body, authenticated, options) as Promise<T>;
}

function deleteRequest<T>(
  endpoint: string,
  params: object = {},
  headers: any = {},
  options: ApiOptions = {},
): Promise<T> {
  const authenticated = options.authenticated !== undefined ? options.authenticated : true;
  return request('delete', endpoint, params, headers, null, authenticated, options) as Promise<T>;
}

export default {
  request,
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
};
