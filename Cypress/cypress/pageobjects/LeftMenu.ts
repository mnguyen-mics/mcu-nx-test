import Page from './Page';
import { logFunction, logGetter } from './log/LoggingDecorator';

class LeftMenu extends Page {
  @logGetter()
  get settingsMainMenuContainer() {
    return cy.get('.mcs-settingsMainMenu_container');
  }

  @logGetter()
  get myAccount() {
    return cy.get('.mcs-settingsMainMenu_menu\\.account\\.title');
  }

  @logGetter()
  get organisation() {
    return cy.get('.mcs-settingsMainMenu_menu\\.organisation\\.title');
  }

  @logGetter()
  get datamart() {
    return cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title');
  }

  @logGetter()
  get campaigns() {
    return cy.get('.mcs-settingsMainMenu_menu\\.campaigns\\.title');
  }

  @logGetter()
  get services() {
    return cy.get('.mcs-settingsMainMenu_menu\\.service\\.offers\\.title');
  }

  @logGetter()
  get arrowMenu() {
    return cy.get('.mcs-settingsMainMenu_container_arrowMenu');
  }

  @logGetter()
  get settingsMainMenu() {
    return cy.get('.mcs-settings-main-menu');
  }

  @logFunction()
  clickMyAccount() {
    this.myAccount.click();
  }

  @logFunction()
  clickOrganisation() {
    this.organisation.click();
  }

  @logFunction()
  clickDatamart() {
    this.datamart.click();
  }

  @logFunction()
  clickCampaigns() {
    this.campaigns.click();
  }

  @logFunction()
  clickServices() {
    this.services.click();
  }

  @logFunction()
  clickArrowMenu() {
    this.arrowMenu.click();
  }

  @logFunction()
  clickHomeMenu() {
    cy.get('.mcs-sideBar-menuItem_simple').click();
  }

  @logFunction()
  clickAudienceMenu() {
    cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
  }

  @logFunction()
  clickCampaignsMenu() {
    cy.get('.mcs-sideBar-subMenu_menu\\.campaign\\.title').click();
  }

  @logFunction()
  clickAutomationsMenu() {
    cy.get('.mcs-sideBar-subMenu_menu\\.automation\\.title').click();
  }

  @logFunction()
  clickCreativesMenu() {
    cy.get('.mcs-sideBar-subMenu_menu\\.library\\.title').click();
  }

  @logFunction()
  clickLibraryMenu() {
    cy.get('.mcs-sideBar-subMenu_menu\\.library\\.title').click();
  }

  @logFunction()
  clickDataStudioMenu() {
    cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();
  }

  @logFunction()
  goToSegmentsPage() {
    cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
    cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.segments').click();
  }

  @logFunction()
  goToHomePage() {
    cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.home').click();
  }

  @logFunction()
  clickDataStudioQuerryTool() {
    cy.get('.mcs-sideBar-subMenuItem_menu\\.dataStudio\\.query').click();
  }

  @logFunction()
  clickMyDatamart() {
    cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
  }

  @logFunction()
  clickAudienceBuilder() {
    cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.builder').click();
  }
}

export default new LeftMenu();
