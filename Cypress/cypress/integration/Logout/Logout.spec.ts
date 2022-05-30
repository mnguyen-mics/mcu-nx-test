import ActionbarObject from '../../pageobjects/ActionbarObject';
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
    ActionbarObject.actionbar.should('be.visible');
    ActionbarObject.clickUserIcon();
    ActionbarObject.clickBtnLogout();
    LoginPageKeycloak.formLogin.should('be.visible');
  });
});
