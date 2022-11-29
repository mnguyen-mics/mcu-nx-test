import Page from './../Page';
import { logFunction, logGetter } from './../log/LoggingDecorator';

class SettingsMenu extends Page {
  @logGetter()
  get settingsMainMenuContainer() {
    return cy.get('.mcs-settingsMainMenu_container');
  }

  @logFunction()
  clickMyAccount() {
    cy.get('.mcs-settingsMainMenu_menu\\.account\\.title').click();
  }

  @logFunction()
  clickOrganisation() {
    cy.get('.mcs-settingsMainMenu_menu\\.organisation\\.title').click();
  }

  @logFunction()
  clickDatamart() {
    cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
  }

  @logFunction()
  clickCampaigns() {
    cy.get('.mcs-settingsMainMenu_menu\\.campaigns\\.title').click();
  }

  @logFunction()
  clickServices() {
    cy.get('.mcs-settingsMainMenu_menu\\.service\\.offers\\.title').click();
  }
}

export default new SettingsMenu();
