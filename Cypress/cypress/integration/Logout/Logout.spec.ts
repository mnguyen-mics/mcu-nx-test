import Header from '../../pageobjects/Header';
import LoginPageKeycloak from '../../pageobjects/LoginPageKeycloak';

describe('Should test logout on the new NavBar', () => {
  beforeEach(() => {
    window.localStorage.setItem('features', '["new-navigation-system"]');
    cy.login();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Logout after clicking the logout button', () => {
    Header.header.should('be.visible');
    Header.clickUserIcon();
    Header.clickBtnLogout();
    LoginPageKeycloak.formLogin.should('be.visible');
  });
});
