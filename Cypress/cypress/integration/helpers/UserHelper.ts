import { postRequest } from './ApiHelper';

export interface UserQuery {
  first_name: string;
  last_name: string;
  email: string;
  organisation_id: string;
  community_id: string;
  id: string;
  last_password_update: string;
  locale: string;
}

export async function createUserQuery(
  access_token: string,
  organisationId: string,
  firstName: string = `fn-${Math.random().toString(36).substring(2, 10)}`,
  lastName: string = `ln-${Math.random().toString(36).substring(2, 10)}`,
  email: string = `email.-${Math.random().toString(36).substring(2, 10)}@test.com`,
): Promise<UserQuery> {
  const endpoint = 'users';
  const body = {
    first_name: firstName,
    last_name: lastName,
    email: email,
    organisation_id: organisationId,
  };
  return postRequest(endpoint, access_token, body).then(({ data: user }) => {
    return user;
  });
}

export interface RoleQuery {
  creation_date: number;
  id: string;
  organisation_id: string;
  role: string;
}

export async function setRoleQuery(
  access_token: string,
  userId: string,
  organisationId: string,
  role: string,
): Promise<RoleQuery> {
  const endpoint = `users/${userId}/user_roles`;
  const body = {
    organisation_id: organisationId,
    role: role,
  };
  return postRequest(endpoint, access_token, body).then(({ data: role }) => {
    return role;
  });
}

export function createUserAndLoginWithIt(organisationId: string, role: string) {
  cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
    const user = await createUserQuery(data.accessToken, organisationId);

    cy.exec(
      `ssh -o StrictHostKeyChecking=no -l ${Cypress.env('userName')} ${Cypress.env(
        'virtualPlatformName',
      )}.mics-sandbox.com <<eof
    curl -k -H 'Authorization: annie lennox' -H 'Content-Type: application/json' -X GET http://10.0.1.3:9110/private/v1/users/${
      user.id
    }/password_tokens
eof`,
    ).then(async result => {
      const pass = 'test-P455';
      let jsonData = result.stdout.split(/\r?\n/);
      let json = JSON.parse(jsonData[jsonData.length - 1]);
      let token = json.data[0].token;

      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/authentication/set_password`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          email: user.email,
          token: token,
          password: pass,
        },
      });

      await setRoleQuery(data.accessToken, user.id, organisationId, role);

      cy.login(user.email, pass);
    });
  });
}
