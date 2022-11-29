import Page from './../../Page';
import { logFunction } from './../../log/LoggingDecorator';

class DatamartMenu extends Page {
  @logFunction()
  clickMyDatamart() {
    cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
  }

  @logFunction()
  clickPartitions() {
    cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.partitions').click();
  }

  @logFunction()
  clickCompartments() {
    cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.compartments').click();
  }

  @logFunction()
  clickChannels() {
    cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.channels').click();
  }

  @logFunction()
  clickMlFunctions() {
    cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.ml_functions').click();
  }

  @logFunction()
  clickCleaningRules() {
    cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.cleaningRules').click();
  }

  @logFunction()
  clickActivityAnalyser() {
    cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.activity_analyzer').click();
  }
}

export default new DatamartMenu();
