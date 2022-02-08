describe('Should not access the platform when using bad credentials', () => {
  beforeEach(() => {
    cy.logout();
    window.localStorage.setItem('enable_keycloak', 'true');
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Login with bad credentials', () => {
    cy.visit('/');
    // Login with bad email
    cy.get('#username').type('badEmail');
    cy.get('#kc-login').click();
    cy.get('.input-error').should('be.visible').and('contain', 'Invalid email');

    // Login with bad password
    cy.get('#username').type('{selectall}{backspace}' + `${Cypress.env('devMail')}`);
    cy.get('#kc-login').click();
    cy.get('#password').type('{selectall}{backspace}qsdfjdsqN7@kfeu');
    cy.get('#kc-login').click();
    cy.get('.input-error').should('be.visible').and('contain', 'Invalid password');

    // Login with bad email and bad password
    cy.get('#reset-login').click();
    cy.get('#username').type('{selectall}{backspace}' + 'sdfsdf@mediarithmics.com');
    cy.get('#kc-login').click();
    cy.get('#password').type('{selectall}{backspace}qsdfjdsqN7@kfeu');
    cy.get('#kc-login').click();
    cy.get('.input-error').should('be.visible').and('contain', 'Invalid password');
  });
});
