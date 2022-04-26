describe('Should test logout on the new NavBar', () => {
  beforeEach(() => {
    window.localStorage.setItem('features', '["new-navigation-system"]');
    cy.login();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Logout after clicking the logout button', () => {
    cy.get('.mcs-actionbar').should('be.visible');
    cy.get('.mcs-user').click();
    cy.contains('Log out').click();
    cy.get('.mcs-keycloak_formLogin').should('be.visible');
  });
});
