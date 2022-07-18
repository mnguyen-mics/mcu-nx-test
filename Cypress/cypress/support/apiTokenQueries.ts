import faker from 'faker';

export async function newAPIToken(): Promise<string> {
  let token = await getAPIToken();
  const accessTokenJSON = JSON.stringify({
    virtualPlatformName: Cypress.env('virtualPlatformName'),
    apiToken: token,
  });
  cy.writeFile('cypress/fixtures/apiToken.json', accessTokenJSON);
  return token;
}

export async function getAPIToken() {
  console.log('getAPIToken');
  let refreshToken = await createRefreshTokenQuery();
  let accessToken = await createAccessTokenQuery(refreshToken.data.refresh_token);
  let apiToken = await createAPITokenQuery(accessToken.access_token);
  return apiToken.value;
}

export interface RefreshTokenQuery {
  data: {
    refresh_token: string;
  };
  status: string;
}

export async function createRefreshTokenQuery(
  email: string = `${Cypress.env('devMail')}`,
  password: string = `${Cypress.env('devPwd')}`,
  method: string = 'POST',
): Promise<RefreshTokenQuery> {
  const endpoint = 'authentication/refresh_tokens';
  const body = {
    email: email,
    password: password,
  };
  const request: RequestInit = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };

  return fetch(`${Cypress.env('apiDomain')}/v1/${endpoint}`, request).then(response =>
    response.json(),
  );
}

export interface AccessTokenQuery {
  refresh_token: string;
  expires_in: string;
  access_token: string;
}

export async function createAccessTokenQuery(refresh_token: string): Promise<AccessTokenQuery> {
  const endpoint = 'authentication/access_tokens';
  const body = {
    refresh_token: refresh_token,
  };
  return postRequest(endpoint, refresh_token, body).then(({ data: token }) => {
    return token;
  });
}

export interface ApiTokenQuery {
  id: string;
  name: string;
  creation_date: number;
  expiration_date: number;
  value: string;
}

export async function createAPITokenQuery(
  access_token: string,
  tokenName: string = `${faker.random.word()}-${Math.random().toString(36).substring(2, 10)}`,
): Promise<ApiTokenQuery> {
  const endpoint = 'users/20/api_tokens?organisation_id=1';
  const body = {
    name: tokenName,
  };
  return postRequest(endpoint, access_token, body).then(({ data: token }) => {
    return token;
  });
}

export const postRequest = (endpoint: string, access_token: string, body?: any) =>
  request('POST', endpoint, access_token, body);

export const getRequest = (endpoint: string, access_token: string, body?: any) =>
  request('GET', endpoint, access_token);

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
