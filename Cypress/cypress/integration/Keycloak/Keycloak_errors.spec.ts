import loginPageKeycloak from '../../pageobjects/LoginPageKeycloak';
import faker from 'faker';

describe('Should not access the platform when using bad credentials', () => {
  beforeEach(() => {
    cy.logout();
    window.localStorage.setItem('enable_keycloak', 'true');
    cy.visit('/');
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Login with bad credentials', () => {
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
});
