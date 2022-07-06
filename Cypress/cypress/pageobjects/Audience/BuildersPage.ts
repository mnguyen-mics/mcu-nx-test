import Page from '../Page';
import LeftMenu from '../LeftMenu';

class BuildersPage extends Page {
  constructor() {
    super();
  }
  goToPage() {
    LeftMenu.clickAudienceMenu();
    LeftMenu.clickAudienceBuilder();
  }

  get standardSegmentBuilder() {
    return cy.get('.mcs-standardSegmentBuilder_dropdownContainer');
  }

  get liveDashboard() {
    return cy.get('.mcs-standardSegmentBuilder_liveDashboard');
  }

  get dashboardPageContent() {
    return cy.get('.mcs-dashboardPage_content');
  }
}

export default BuildersPage;
