import Page from './Page';

class HeaderMenu extends Page {

  get header() {
    return cy.get('.mcs-header');
  }

  get settingsIcon() {
    return cy.get('.mcs-header_actions_settings');
  }

  get userIcon() {
    return cy.get('.mcs-user');
  }

  get userMenu() {
    return cy.get('ant-dropdown-menu');
  }

  get btnAccount() {
    return this.userMenu.within(() => {
      cy.contains('Account');
    });
  }

  get btnLogout() {
    return cy.contains('Log out');
  }

  get orgSwitchComponent() {
    return cy.get('.mcs-organisationListSwitcher_component');
  }

  get orgSwitchSearchInput() {
    return cy.get('.mcs-organisationListSwitcher_searchInput').eq(0).find('input');
  }

  get orgSwitchSearchView() {
    return cy.get('.mcs-organisationListSwitcher_orgId_searchView');
  }

  get btnApps() {
    return cy.get('.mcs-header_actions_appLauncher');
  }

  get appMenu() {
    return cy.get('.mcs_appMenu');
  }

  clickSettingsIcon() {
    this.settingsIcon.click();
  }

  clickUserIcon() {
    this.userIcon.click();
  }

  clickBtnAccount() {
    this.btnAccount.click();
  }

  clickBtnLogout() {
    this.btnLogout.click();
  }

  clickOrgSwitchComponent() {
    this.orgSwitchComponent.click();
  }

  clickOrgSwitchSearchView() {
    this.orgSwitchSearchView.click({ force: true });
  }

  clickBtnApps() {
    this.btnApps.click();
  }

  clickBtnNavigator() {
    this.appMenu.within(() => {
      cy.contains('Navigator').click();
    });
  }

  clickBtnComputingConsole() {
    this.appMenu.within(() => {
      cy.contains('Computing Console').click();
    });
  }

  clickBtnPlatformAdmin() {
    this.appMenu.within(() => {
      cy.contains('Platform Admin').click();
    });
  }

  clickBtnDeveloperDocumentation() {
    this.appMenu.within(() => {
      cy.contains('Deveoper Documentation').click();
    });
  }

  clickBtnUserGuide() {
    this.appMenu.within(() => {
      cy.contains('User Guide').click();
    });
  }

  clickLogoMics() {
    this.appMenu.within(() => {
      cy.get('.mcs-logo-placeholder').click();
    });
  }

  typeOrgSwitchSearchInput(organisationName: string) {
    this.orgSwitchSearchInput.type(organisationName);
  }

  switchOrg(organisationName: string) {
    this.clickOrgSwitchComponent();
    this.typeOrgSwitchSearchInput(organisationName);
    cy.wait(500);
    this.clickOrgSwitchSearchView();
  }
}

export default new HeaderMenu();
