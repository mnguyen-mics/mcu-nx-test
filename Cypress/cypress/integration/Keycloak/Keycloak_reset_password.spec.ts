import loginPageKeycloak from '../../pageobjects/LoginPage';
import Keycloak from '../../utils/Keycloak';

describe('Should test keycloak update password', () => {
  const keycloak = new Keycloak();

  beforeEach(() => {
    cy.logout();
    window.localStorage.setItem('enable_keycloak', 'true');
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should check password rotation', () => {
    cy.visit('/').then(async () => {
      const passwordRequirements = await keycloak.getPasswordRequirements(Cypress.env('apiToken'));
      const minDigitCount = passwordRequirements.data.min_digit_count;
      const minSpecialCharsCount = passwordRequirements.data.min_special_chars_count;
      const differentLetterCaseNeeded = passwordRequirements.data.different_lettre_case_needed;
      const minLength = passwordRequirements.data.min_length;
      const forbidPopularPasswords = passwordRequirements.data.forbid_popular_passwords;

      const email = 'mckongkong@mediarithmics.com';
      loginPageKeycloak.login(email);

      // Should check the password rotation of one year
      loginPageKeycloak.alertSuccess.should(
        'contain',
        'You need to change your password to activate your account',
      );

      // Should show the password requirements
      loginPageKeycloak
        .getPasswordRequirements()
        .should('contain', minLength + ' characters minimum')
        .and('contain', minDigitCount + ' digit(s) minimum')
        .and('contain', minSpecialCharsCount + ' special character(s) minimum');

      // Insert not matching passwords
      loginPageKeycloak.typeNewPassword('12234');
      loginPageKeycloak.typeConfirmPassword('1234');
      loginPageKeycloak
        .getPasswordRequirements(false)
        .should('contain', 'Both passwords should match');
      loginPageKeycloak.btnSubmitPassword.should('be.disabled');

      // Should not accept short and obvious password
      if (forbidPopularPasswords == 'true') {
        loginPageKeycloak.typeNewPassword('1234');
        loginPageKeycloak.typeConfirmPassword('1234');
        loginPageKeycloak
          .getPasswordRequirements(false)
          .should('contain', 'Passwords cannot be too obvious')
          .and('contain', minLength + ' characters minimum');
        loginPageKeycloak.btnSubmitPassword.should('be.disabled');
      }

      // Should not accept password without 1 special character
      loginPageKeycloak.typeNewPassword('qsdfjdsqN7kfeu');
      loginPageKeycloak.typeConfirmPassword('qsdfjdsqN7kfeu');
      loginPageKeycloak
        .getPasswordRequirements(false)
        .should('contain', minSpecialCharsCount + ' special character(s) minimum');
      loginPageKeycloak.btnSubmitPassword.should('be.disabled');

      // Should not accept password without both upper case and lower case
      if (differentLetterCaseNeeded == 'true') {
        loginPageKeycloak.typeNewPassword('qsdfjdsqn@7kfeu');
        loginPageKeycloak.typeConfirmPassword('qsdfjdsqn@7kfeu');
        loginPageKeycloak
          .getPasswordRequirements(false)
          .should('contain', 'One lowercase and one uppercase character');
        loginPageKeycloak.btnSubmitPassword.should('be.disabled');
      }

      // Should not accept password without numbers
      loginPageKeycloak.typeNewPassword('qsdfjdsqN@kfeu');
      loginPageKeycloak.typeConfirmPassword('qsdfjdsqN@kfeu');
      loginPageKeycloak
        .getPasswordRequirements(false)
        .should('contain', minDigitCount + ' digit(s) minimum');
      loginPageKeycloak.btnSubmitPassword.should('be.disabled');

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
      loginPageKeycloak.typeNewPassword(password);
      loginPageKeycloak.typeConfirmPassword(password);
      loginPageKeycloak.getPasswordRequirements(false).should('have.length', 0);
      loginPageKeycloak.btnSubmitPassword.should('be.enabled');
      loginPageKeycloak.clickBtnSubmitPassword();
      cy.url().should('contains', Cypress.config().baseUrl + '/#/v2/o/1/campaigns');

      // Logout
      cy.logout();

      // Login with old password
      loginPageKeycloak.login(email);
      loginPageKeycloak.errorPassword.should('be.visible').and('contain', 'Invalid password');

      // Login with the new password
      loginPageKeycloak.typePassword(password);
      loginPageKeycloak.clickBtnSignIn();
      cy.url().should('contains', Cypress.config().baseUrl + '/#/v2/o/1/campaigns');
    });
  });
});
