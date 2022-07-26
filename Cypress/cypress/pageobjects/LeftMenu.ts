import Page from './Page';
import { logFunction, logGetter } from './log/LoggingDecorator';

class LeftMenu extends Page {
  @logGetter()
  get arrowMenu() {
    return cy.get('.mcs-settingsMainMenu_container_arrowMenu');
  }

  @logGetter()
  get settingsMainMenu() {
    return cy.get('.mcs-settings-main-menu');
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

  @logFunction()
  clickAudienceMonitoring() {
    cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.monitoring').click();
  }

  @logFunction()
  clickAudienceSegments() {
    cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.segments').click();
  }

  @logFunction()
  clickCampaignsGoals() {
    cy.get('.mcs-sideBar-subMenuItem_menu\\.campaign\\.goals').click();
  }

  @logFunction()
  clickAutomationsBuilder() {
    cy.get('.mcs-sideBar-subMenuItem_menu\\.automation\\.builder').click();
  }

  @logFunction()
  clickDataStudioFunnel() {
    cy.get('.mcs-sideBar-subMenuItem_menu\\.dataStudio\\.funnel').click();
  }

  @logFunction()
  clickDataStudioImports() {
    cy.get('.mcs-sideBar-subMenuItem_menu\\.library\\.Imports').click();
  }

  @logFunction()
  clickDataStudioExports() {
    cy.get('.mcs-sideBar-subMenuItem_menu\\.library\\.Exports').click();
  }
}

export default new LeftMenu();
