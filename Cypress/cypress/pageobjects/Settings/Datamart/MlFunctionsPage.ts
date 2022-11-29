import Page from '../../Page';
import SettingsMenu from '../SettingsMenu';
import DatamartMenu from '../Datamart/DatamartMenu';
import HeaderMenu from '../../HeaderMenu';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class MlFunctionsPage extends Page {
  constructor() {
    super();
  }

  @logFunction()
  goToPage() {
    HeaderMenu.clickSettingsIcon();
    SettingsMenu.clickDatamart();
    DatamartMenu.clickMlFunctions();
  }

  @logGetter()
  get pageMlFunctions() {
    return cy.get('.mcs-content-container');
  }

  @logFunction()
  clickNewMlFunctionsButton() {
    cy.get('.mcs-mlFunctionsContent_newMlFunctionsButton').click();
  }
}

export default MlFunctionsPage;
