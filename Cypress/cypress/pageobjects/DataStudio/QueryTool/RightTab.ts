import Page from '../../Page';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class RightTab extends Page {
  constructor() {
    super();
  }

  @logGetter()
  get chartsSearchPanel() {
    return cy.get('.mcs-charts-search-panel');
  }

  @logFunction()
  typeChartsSearchField(chart: string) {
    cy.get('.mcs-charts-search-panel_search-bar').find('input').clear().type(`${chart}{enter}`);
  }

  @logFunction()
  clickChartsTitle() {
    cy.get('.mcs-OTQLConsoleContainer_right-tab').eq(1).contains('Charts').click();
  }

  @logGetter()
  get fieldNodeContent() {
    return cy.get('.mcs-fieldNode_content');
  }
}

export default RightTab;
