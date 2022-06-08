import Page from '../../../pageobjects/Page';

class OrganisationMenu extends Page {
  get menu() {
    return cy.get('.ant-layout-sider-children');
  }

  clickLabels() {
    cy.get('.mcs-settingsSideMenu_menu\\.organisation\\.labels').click();
  }

  clickProfile() {
    cy.get('.mcs-settingsSideMenu_menu\\.organisation\\.settings').click();
  }

  clickUsers() {
    cy.get('.mcs-settingsSideMenu_menu\\.organisation\\.users').click();
  }

  clickUserRoles() {
    cy.get('.mcs-settingsSideMenu_menu\\.organisation\\.userRoles').click();
  }

  clickProcessingActivities() {
    cy.get('.mcs-settingsSideMenu_menu\\.organisation\\.processings').click();
  }
}

export default new OrganisationMenu();
