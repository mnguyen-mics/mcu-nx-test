describe('Should test keycloak update password', () => {
  beforeEach(() => {
    cy.logout();
    window.localStorage.setItem('enable_keycloak', 'true');
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should check password rotation', () => {
    const email = 'mckongkong@mediarithmics.com';
    cy.visit('/');
    cy.get('#username').type(email);
    cy.get('#kc-login').click();
    cy.get('#password').type(Cypress.env('devPwd'));
    cy.get('#kc-login').click();

    // Should check the password rotation of one year
    cy.get('#kc-content').should(
      'contain',
      'You need to change your password to activate your account',
    );
    // Insert not matching passwords
    cy.get('#password-new').type('12234');
    cy.get('#password-confirm').type('1234');
    cy.get('#kc-form-buttons').click();
    cy.get('#input-error-password-confirm').should('contain', "Passwords don't match");

    // Should not accept short and obvious password
    cy.get('#password-new').type('{selectall}{backspace}1234');
    cy.get('#password-confirm').type('{selectall}{backspace}1234');
    cy.get('#kc-form-buttons').click();
    cy.get('#kc-content-wrapper')
      .should('contain', 'Password must be at least 8 characters long')
      .and('contain', 'Password is too obvious');

    // Should not accept password without 1 special character
    cy.get('#password-new').type('{selectall}{backspace}qsdfjdsqN7kfeu');
    cy.get('#password-confirm').type('{selectall}{backspace}qsdfjdsqN7kfeu');
    cy.get('#kc-form-buttons').click();
    cy.get('#kc-content-wrapper').should(
      'contain',
      'Password must contain at least 1 special character',
    );

    // Should not accept password without both upper case and lower case
    cy.get('#password-new').type('{selectall}{backspace}qsdfjdsqn@7kfeu');
    cy.get('#password-confirm').type('{selectall}{backspace}qsdfjdsqn@7kfeu');
    cy.get('#kc-form-buttons').click();
    cy.get('#kc-content-wrapper').should(
      'contain',
      'Password must contain both upper and lower case characters',
    );

    // Should not accept password without numbers
    cy.get('#password-new').type('{selectall}{backspace}qsdfjdsqN@kfeu');
    cy.get('#password-confirm').type('{selectall}{backspace}qsdfjdsqN@kfeu');
    cy.get('#kc-form-buttons').click();
    cy.get('#kc-content-wrapper').should('contain', 'Password must contain at least 1 digit');

    // Should not accept the same password
    // TODO: should have a valid password to reset, right now the vagrant password doesn't respect the password complexity
    // If I wanna check that we don't allow the new password to be like the old one, I need to change the vagrant password
    // to a valid one, then reset the password and test if inserting the same password again trigger an error
    // As of today, we can't reset password in our automated test since it requires an email service
    // The only way is for this to work is to expire again in the database the user password but that is not a good practice
    // We just should make sure next time when we update the vagrant password it is a valid one !

    // cy.get('#password-new').type('{selectall}{backspace}' + Cypress.env('devPwd'));
    // cy.get('#password-confirm').type('{selectall}{backspace}' + Cypress.env('devPwd'));
    // cy.get('#kc-form-buttons').click();
    // cy.get('.alert-error-newlines').should('be.visible');

    // Insert a valid password
    const password = 'qsdfjdsqN7@kfeu';
    cy.get('#password-new').type('{selectall}{backspace}' + password);
    cy.get('#password-confirm').type('{selectall}{backspace}' + password);
    cy.get('#kc-form-buttons').click();
    cy.url().should('contains', Cypress.config().baseUrl + '/#/v2/o/1/campaigns/display');

    // Logout
    cy.logout();

    // Login with old password
    cy.get('#username').type(email);
    cy.get('#kc-login').click();
    cy.get('#password').type(Cypress.env('devPwd'));
    cy.get('#kc-login').click();
    cy.get('.input-error').should('be.visible').and('contain', 'Invalid password');

    // Login with the new password
    cy.get('#password').type('{selectall}{backspace}' + password);
    cy.get('#kc-login').click();
    cy.url().should('contains', Cypress.config().baseUrl + '/#/v2/o/1/campaigns/display');
  });
});
