import Page from '../../../pageobjects/Page';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class OrganisationMenu extends Page {
  @logGetter()
  get menu() {
    return cy.get('.ant-layout-sider-children');
  }

  @logFunction()
  clickLabels() {
    cy.get('.mcs-settingsSideMenu_menu\\.organisation\\.labels').click();
  }

  @logFunction()
  clickProfile() {
    cy.get('.mcs-settingsSideMenu_menu\\.organisation\\.settings').click();
  }

  @logFunction()
  clickUsers() {
    cy.get('.mcs-settingsSideMenu_menu\\.organisation\\.users').click();
  }

  @logFunction()
  clickUserRoles() {
    cy.get('.mcs-settingsSideMenu_menu\\.organisation\\.userRoles').click();
  }

  @logFunction()
  clickProcessingActivities() {
    cy.get('.mcs-settingsSideMenu_menu\\.organisation\\.processings').click();
  }
}

export default new OrganisationMenu();
