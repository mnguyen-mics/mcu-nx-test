describe('Should test keycloak login', () => {
  before(() => {
    window.localStorage.setItem('enable_keycloak', 'true');
  });

  beforeEach(() => {
    cy.logout();
    window.localStorage.setItem('enable_keycloak', 'true');
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Login without using an external identity provider', () => {
    cy.kcLogin();
    cy.url().should('contains', Cypress.config().baseUrl + '/#/v2/o/1/campaigns/display');
  });
});
