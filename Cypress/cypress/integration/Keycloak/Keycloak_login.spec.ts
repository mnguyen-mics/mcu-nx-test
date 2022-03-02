import loginPageKeycloak from '../../pageobjects/loginPageKeycloak';

describe('Should test keycloak login', () => {
  beforeEach(() => {
    cy.logout();
    window.localStorage.setItem('enable_keycloak', 'true');
    cy.visit('/');
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Login without using an external identity provider', () => {
    loginPageKeycloak.login();
    cy.url().should('contains', Cypress.config().baseUrl + '/#/v2/o/1/campaigns/display');
  });
});
