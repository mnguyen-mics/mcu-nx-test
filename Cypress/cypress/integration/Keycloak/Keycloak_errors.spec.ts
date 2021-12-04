describe('Should not access the platform when using bad credentials', () => {
  before(() => {
    window.localStorage.setItem('enable_keycloak', 'true');
  });
  beforeEach(() => {
    cy.logout();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Login with bad credentials', () => {
    // Login with bad email
    cy.kcLogin('badEmail');
    cy.get('.input-error').should('be.visible').and('contain', 'Invalid username or password');

    // Login with bad password
    cy.get('#username').type('{selectall}{backspace}' + `${Cypress.env('devMail')}`);
    cy.get('#password').type('{selectall}{backspace}qsdfjdsqN7@kfeu');
    cy.get('#kc-login').click();
    cy.get('.input-error').should('be.visible').and('contain', 'Invalid username or password');

    // Login with bad email and bad password
    cy.get('#username').type('{selectall}{backspace}' + 'sdfsdf@mediarithmics.com');
    cy.get('#password').type('{selectall}{backspace}qsdfjdsqN7@kfeu');
    cy.get('#kc-login').click();
    cy.get('.input-error').should('be.visible').and('contain', 'Invalid username or password');
  });
});
