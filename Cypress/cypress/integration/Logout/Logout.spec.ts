import Header from '../../pageobjects/HeaderMenu';
import LoginPage from '../../pageobjects/LoginPage';

describe('Should test logout on the new NavBar', () => {
  beforeEach(() => {
    window.localStorage.setItem('features', '["new-navigation-system"]');
    cy.login();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Logout after clicking the logout button', () => {
    const loginPageKeycloak = new LoginPage(Cypress.env('apiToken'));
    Header.header.should('be.visible');
    Header.clickUserIcon();
    Header.clickBtnLogout();
    loginPageKeycloak.formLogin.should('be.visible');
  });
});
