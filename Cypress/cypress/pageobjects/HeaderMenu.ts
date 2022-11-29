import Page from './Page';
import { logFunction, logGetter } from './log/LoggingDecorator';

class HeaderMenu extends Page {
  @logGetter()
  get header() {
    return cy.get('.mcs-header');
  }

  @logGetter()
  get settingsIcon() {
    return cy.get('.mcs-header_actions_settings');
  }

  @logGetter()
  get userIcon() {
    return cy.get('.mcs-user');
  }

  @logGetter()
  get userMenu() {
    return cy.get('ant-dropdown-menu');
  }

  @logGetter()
  get btnAccount() {
    return this.userMenu.within(() => {
      cy.contains('Account');
    });
  }

  @logGetter()
  get btnLogout() {
    return cy.contains('Log out');
  }

  @logGetter()
  get orgSwitchComponent() {
    cy.reload();
    return cy.get('.mcs-organisationListSwitcher_component', { timeout: 60000 });
  }

  @logGetter()
  get orgSwitchSearchInput() {
    return cy.get('.mcs-organisationListSwitcher_searchInput').eq(0).find('input');
  }

  @logGetter()
  get orgSwitchSearchView() {
    return cy.get('.mcs-organisationListSwitcher_orgId_searchView');
  }

  @logGetter()
  get btnApps() {
    return cy.get('.mcs-header_actions_appLauncher');
  }

  @logGetter()
  get appMenu() {
    return cy.get('.mcs_appMenu');
  }

  @logGetter()
  get organisationName() {
    return cy.get('.mcs-organisationListSwitcher_orgName');
  }

  @logFunction()
  clickSettingsIcon() {
    this.settingsIcon.click();
  }

  @logFunction()
  clickUserIcon() {
    this.userIcon.click();
  }

  @logFunction()
  clickBtnAccount() {
    this.btnAccount.click();
  }

  @logFunction()
  clickBtnLogout() {
    this.btnLogout.click();
  }

  @logFunction()
  clickOrgSwitchComponent() {
    this.orgSwitchComponent.click();
  }

  @logFunction()
  clickOrgSwitchSearchView() {
    this.orgSwitchSearchView.first().click({ force: true });
  }

  @logFunction()
  clickOrgIdSwitchSearchView(orgName: string) {
    this.orgSwitchSearchView.contains(orgName).first().click({ force: true });
  }

  @logFunction()
  clickBtnApps() {
    this.btnApps.click();
  }

  @logFunction()
  clickBtnNavigator() {
    this.appMenu.within(() => {
      cy.contains('Navigator').click();
    });
  }

  @logFunction()
  clickBtnComputingConsole() {
    this.appMenu.within(() => {
      cy.contains('Computing Console').click();
    });
  }

  @logFunction()
  clickBtnPlatformAdmin() {
    this.appMenu.within(() => {
      cy.contains('Platform Admin').click();
    });
  }

  @logFunction()
  clickBtnDeveloperDocumentation() {
    this.appMenu.within(() => {
      cy.contains('Deveoper Documentation').click();
    });
  }

  @logFunction()
  clickBtnUserGuide() {
    this.appMenu.within(() => {
      cy.contains('User Guide').click();
    });
  }

  @logFunction()
  clickLogoMics() {
    this.appMenu.within(() => {
      cy.get('.mcs-logo-placeholder').click();
    });
  }

  @logFunction()
  typeOrgSwitchSearchInput(organisationName: string) {
    this.orgSwitchSearchInput.type(organisationName);
  }

  @logFunction()
  switchOrg(organisationName: string) {
    this.clickOrgSwitchComponent();
    this.typeOrgSwitchSearchInput(organisationName);
    cy.wait(500);
    this.clickOrgSwitchSearchView();
  }

  @logFunction()
  switchOrgWithCreatedUser(organisationId: string) {
    this.clickOrgSwitchComponent();
    cy.wait(500);
    this.clickOrgIdSwitchSearchView(organisationId);
  }
}

export default new HeaderMenu();
