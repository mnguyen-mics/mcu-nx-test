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
}

export default new DatamartMenu();
