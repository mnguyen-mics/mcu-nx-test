import Page from '../../../Page';
import { logFunction } from '../../../log/LoggingDecorator';

class SelectDatamartPage extends Page {
  constructor() {
    super();
  }

  @logFunction()
  clickOnDatamart(name: string) {
    cy.get('.mcs-menu-list').contains(name).click();
  }
}

export default SelectDatamartPage;
