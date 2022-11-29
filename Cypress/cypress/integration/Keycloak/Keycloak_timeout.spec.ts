import LoginPage from '../../pageobjects/LoginPage';
import faker from 'faker';

describe('Should get timeout after 5 login attempts', () => {
  beforeEach(() => {
    cy.logout();
    cy.visit('/');
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should get a timeout after 5 login attempts', () => {
    const loginPageKeycloak = new LoginPage(Cypress.env('apiToken'));
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
