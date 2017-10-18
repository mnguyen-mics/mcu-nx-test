import 'whatwg-fetch';
import { isEmpty } from 'lodash';

import AuthService from './AuthService';

export type StatusCode = 'ok' | 'error';

interface Response {
  status: StatusCode;
}

export interface DataResponse<T> extends Response {
  data: T;
}

export interface DataListResponse<T> extends Response {
  data: T;
  count: number;
  first_result?: number;
  max_results?: number;
  total?: number;
}

const MCS_CONSTANTS = (window as any).MCS_CONSTANTS || {}; // eslint-disable-line no-undef
const LOCAL_URL = '/';
const API_URL = `${MCS_CONSTANTS.API_URL}/v1/`;
const ADMIN_API_URL = `${MCS_CONSTANTS.ADMIN_API_URL}/v1/`;

type requestMethod = 'get' | 'post' | 'put' | 'delete';

function request(
  method: requestMethod,
  endpoint: string,
  params: string[],
  headers: {
    Authorization: string;
    'Accept'?: string;
    'Content-Type'?: string;
    'X-Requested-By'?: string;
  },
  body: object | null | string,
  authenticated: boolean = true,
  options: {
    localUrl: string,
    adminApi: object;
    withCredentials: object;
    authenticated: boolean;
  },
  credentials: 'include' | 'omit' | 'same-origin' | undefined,
): Promise<Response> {

  const paramsToQueryString: (paramsArg: string[]) => string = (paramsArg: string[]) => {
    if (!paramsArg) return '';
    const paramsToArray: string[] = Object.keys(paramsArg);
    const str: string = paramsToArray
      .map((key: any) => `${encodeURIComponent(key)}=${encodeURIComponent(paramsArg[key])}`)
      .join('&');
    return str.length ? `?${str}` : '';
  };

  let url = options.adminApi ? ADMIN_API_URL : options.localUrl ? LOCAL_URL : API_URL;
  url = `${url}${endpoint}${paramsToQueryString(params)}`;

  const token = AuthService.getAccessToken();

  const config = {
    method,
    headers,
    credentials,
    body,
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

  const checkAndParse: (response: any) => any = response => {
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.indexOf('image/png') !== -1) {
      return response.blob().then((blob: any) => {
        if (!response.ok) {
          Promise.reject(blob);
        }
        return blob;
      });
    }

    // Considered as a json response by default
    return response.json().then((json: any) => {
      if (!response.ok) {
        return Promise.reject(json);
      }

      return json;
    });

  };

  return fetch(url, config) // eslint-disable-line no-undef
    .then(checkAndParse);
}

function get<T>(
  endpoint: string,
  params: string[],
  headers: {
    Authorization: string;
    'Accept': string;
    'Content-Type': string;
    'X-Requested-By': string;
  },
  options: {
    authenticated: boolean;
    localUrl: string;
    withCredentials: object;
    adminApi: object;
  },
  credentials: 'include' | 'omit' | 'same-origin' | undefined,
): Promise<DataResponse<T>> {
  const authenticated: boolean = options.authenticated !== undefined ? options.authenticated : true;
  return request('get', endpoint, params, headers, null, authenticated, options, credentials) as Promise<DataResponse<T>>;
}

function getList<T>(
  endpoint: string,
  params: string[],
  headers: {
    Authorization: string;
    'Accept': string;
    'Content-Type': string;
    'X-Requested-By': string;
  },
  options: {
    authenticated: boolean;
    localUrl: string;
    withCredentials: object;
    adminApi: object;
  },
  credentials: 'include' | 'omit' | 'same-origin' | undefined,
): Promise<DataListResponse<T>> {
  const authenticated: boolean = options.authenticated !== undefined ? options.authenticated : true;
  return request('get', endpoint, params, headers, null, authenticated, options, credentials) as Promise<DataListResponse<T>>;
}

export default {
  request,
  get,
  getList,
};
