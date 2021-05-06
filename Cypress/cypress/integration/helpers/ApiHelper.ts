export type StatusCode = 'ok' | 'error';

interface ApiResponse {
  status: StatusCode;
}

export interface DataResponse<T> extends ApiResponse {
  data: T;
}

const request = (method: string, endpoint: string, body?: any) => {
  const access_token = localStorage.getItem('access_token');
  if (!access_token) throw Error('Could not find access_token in local storage !');

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

export const getRequest = (endpoint: string, body?: any) => request('GET', endpoint);
export const postRequest = (endpoint: string, body?: any) => request('POST', endpoint, body);
export const putRequest = (endpoint: string, body?: any) => request('PUT', endpoint, body);
export const deleteRequest = (endpoint: string, body?: any) => request('delete', endpoint);
