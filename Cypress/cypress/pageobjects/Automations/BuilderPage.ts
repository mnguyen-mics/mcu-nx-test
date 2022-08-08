import Page from '../Page';
import LeftMenu from '../LeftMenu';
import { logFunction, logGetter } from '../log/LoggingDecorator';

class BuilderPage extends Page {
  constructor() {
    super();
  }

  @logFunction()
  goToPage() {
    LeftMenu.clickAutomationsMenu();
    LeftMenu.clickAutomationsBuilder();
  }

  @logGetter()
  get automationTypeSelector() {
    return cy.get('.mcs-automationTemplateSelector');
  }
}

export default BuilderPage;
