import Page from '../Page';
import LeftMenu from '../LeftMenu';
import { logFunction, logGetter } from '../log/LoggingDecorator';

class BuildersPage extends Page {
  constructor() {
    super();
  }

  @logFunction()
  goToPage() {
    LeftMenu.clickAudienceMenu();
    LeftMenu.clickAudienceBuilder();
  }

  @logGetter()
  get standardSegmentBuilder() {
    return cy.get('.mcs-standardSegmentBuilder_dropdownContainer');
  }

  @logGetter()
  get liveDashboard() {
    return cy.get('.mcs-standardSegmentBuilder_liveDashboard');
  }

  @logGetter()
  get dashboardPageContent() {
    return cy.get('.mcs-dashboardPage_content');
  }

  @logGetter()
  get segmentBuilderSelector() {
    return cy.get('.mcs-segmentBuilderSelector_container');
  }
}

export default BuildersPage;
