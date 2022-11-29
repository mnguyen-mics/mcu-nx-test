export type StatusCode = 'ok' | 'error';

interface ApiResponse {
  status: StatusCode;
}

export interface DataResponse<T> extends ApiResponse {
  data: T;
}

const request = (method: string, endpoint: string, access_token: string, body?: any) => {
  const request: RequestInit = {
    method,
    headers: {
      Authorization: access_token,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };

  return fetch(`${Cypress.env('apiDomain')}/v1/${endpoint}`, request).then(response =>
    response.json(),
  );
};

export const getRequest = (endpoint: string, access_token: string, body?: any) =>
  request('GET', endpoint, access_token);
export const postRequest = (endpoint: string, access_token: string, body?: any) =>
  request('POST', endpoint, access_token, body);
export const putRequest = (endpoint: string, access_token: string, body?: any) =>
  request('PUT', endpoint, access_token, body);
export const deleteRequest = (endpoint: string, access_token: string, body?: any) =>
  request('delete', endpoint, access_token);
