import loginPageKeycloak from '../../pageobjects/LoginPage';

describe('Should test keycloak login', () => {
  beforeEach(() => {
    cy.logout();
    cy.visit('/');
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Login without using an external identity provider', () => {
    loginPageKeycloak.login();
    cy.url().should('contains', Cypress.config().baseUrl + '/#/v2/o/1/campaigns/display');
  });

  it('Should view the password by clicking on the view password icon button', () => {
    loginPageKeycloak.typeEmail(Cypress.env('devMail'));
    loginPageKeycloak.clickBtnSignIn();
    loginPageKeycloak.typePassword(Cypress.env('devPwd'));
    loginPageKeycloak.clickBtnViewPassword();
    loginPageKeycloak.passwordField.invoke('attr', 'type').should('eq', 'text');
  });
});
