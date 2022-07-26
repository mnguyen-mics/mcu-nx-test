import Page from '../Page';
import LeftMenu from '../LeftMenu';
import { logFunction, logGetter } from '../log/LoggingDecorator';

class MonitoringPage extends Page {
  constructor() {
    super();
  }

  @logFunction()
  goToPage() {
    LeftMenu.clickAudienceMenu();
    LeftMenu.clickAudienceMonitoring();
  }

  @logGetter()
  get btnUserLookup() {
    return cy.get('.mcs-montioringActionBar_userLookupButton');
  }
}

export default MonitoringPage;
