import loginPageKeycloak from '../../pageobjects/LoginPageKeycloak';
import faker from 'faker';

describe('Should get timeout after 5 login attempts', () => {
  beforeEach(() => {
    cy.logout();
    window.localStorage.setItem('enable_keycloak', 'true');
    cy.visit('/');
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it.skip('Should get a timeout after 5 login attempts', () => {
    const email = 'toto@mediarithmics.com';
    loginPageKeycloak.typeEmail(email);
    loginPageKeycloak.clickBtnSignIn();
    for (let index = 0; index < 6; index++) {
      loginPageKeycloak.typePassword(faker.random.word());
      loginPageKeycloak.clickBtnSignIn();
    }
    loginPageKeycloak.alertError.should(
      'contain',
      'You have exceeded the number of login attempts',
    );
  });
});
