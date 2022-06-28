import LoginPage from '../../pageobjects/LoginPage';
import faker from 'faker';

describe('Access to the platform must fail when using bad credentials', () => {
  beforeEach(() => {
    cy.logout();
    cy.visit('/');
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Login with bad credentials', () => {
    const loginPageKeycloak = new LoginPage(Cypress.env('apiToken'));
    // Login with bad email
    loginPageKeycloak.typeEmail('badEmail');
    loginPageKeycloak.clickBtnSignIn();
    loginPageKeycloak.errorUsername.should('be.visible').and('contain', 'Invalid email');

    // Login with bad password
    loginPageKeycloak.login(undefined, faker.random.word());
    loginPageKeycloak.errorPassword.should('be.visible').and('contain', 'Invalid password');

    // Login with bad email and bad password
    loginPageKeycloak.clickBtnResetLogin();
    loginPageKeycloak.login('sdfsdf@mediarithmics.com', 'qsdfjdsqN7@kfeu');
    loginPageKeycloak.errorPassword.should('be.visible').and('contain', 'Invalid password');
  });

  it('Verify invalid password message after forget password', () => {
    const loginPageKeycloak = new LoginPage(Cypress.env('apiToken'));
    loginPageKeycloak.login('dev@mediarithmics.com', 'badpassword');
    loginPageKeycloak.errorPassword.should('be.visible').and('contain', 'Invalid password');
    loginPageKeycloak.clickBtnResetLogin();
    loginPageKeycloak.typeEmail('dev@mediarithmics.com');
    loginPageKeycloak.clickBtnSignIn();
    loginPageKeycloak.clickLinkForgetPassword();
    loginPageKeycloak.clickContinue();
    loginPageKeycloak.forgetPasswordEmailAlert.contains(
      'You should receive an email shortly with further instructions.',
    );
    loginPageKeycloak.login('dev@mediarithmics.com', 'badpassword');
    loginPageKeycloak.errorPassword.should('be.visible').and('contain', 'Invalid password');
  });
});
