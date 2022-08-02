import Page from './../../Page';
import { logFunction } from './../../log/LoggingDecorator';

class DatamartMenu extends Page {
  @logFunction()
  clickMyDatamart() {
    cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
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
  clickActivityAnalyser() {
    cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.activity_analyzer').click();
  }
}

export default new DatamartMenu();
