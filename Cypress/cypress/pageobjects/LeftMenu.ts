import Page from './Page';

class LeftMenu extends Page {
  get settingsMainMenuContainer() {
    return cy.get('.mcs-settingsMainMenu_container');
  }

  get myAccount() {
    return cy.get('.mcs-settingsMainMenu_menu\\.account\\.title');
  }

  get organisation() {
    return cy.get('.mcs-settingsMainMenu_menu\\.organisation\\.title');
  }

  get datamart() {
    return cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title');
  }

  get campaigns() {
    return cy.get('.mcs-settingsMainMenu_menu\\.campaigns\\.title');
  }

  get services() {
    return cy.get('.mcs-settingsMainMenu_menu\\.service\\.offers\\.title');
  }

  get arrowMenu() {
    return cy.get('.mcs-settingsMainMenu_container_arrowMenu');
  }

  get settingsMainMenu() {
    return cy.get('.mcs-settings-main-menu');
  }

  clickMyAccount() {
    this.myAccount.click();
  }

  clickOrganisation() {
    this.organisation.click();
  }

  clickDatamart() {
    this.datamart.click();
  }

  clickCampaigns() {
    this.campaigns.click();
  }

  clickServices() {
    this.services.click();
  }

  clickArrowMenu() {
    this.arrowMenu.click();
  }

  clickHomeMenu() {
    cy.get('.mcs-sideBar-menuItem_simple').click();
  }

  clickAudienceMenu() {
    cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
  }

  clickCampaignsMenu() {
    cy.get('.mcs-sideBar-subMenu_menu\\.campaign\\.title').click();
  }

  clickAutomationsMenu() {
    cy.get('.mcs-sideBar-subMenu_menu\\.automation\\.title').click();
  }

  clickCreativesMenu() {
    cy.get('.mcs-sideBar-subMenu_menu\\.library\\.title').click();
  }

  clickLibraryMenu() {
    cy.get('.mcs-sideBar-subMenu_menu\\.library\\.title').click();
  }

  clickDataStudioMenu() {
    cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();
  }

  goToSegmentsPage() {
    cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
    cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.segments').click();
  }

  goToHomePage = () => {
    cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.home').click();
  };
}

export default new LeftMenu();
