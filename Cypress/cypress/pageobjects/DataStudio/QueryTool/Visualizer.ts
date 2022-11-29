import Page from '../../Page';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

// Visualizer tab on the right with schema and charts
class Visualizer extends Page {
  constructor() {
    super();
  }

  get myself() {
    return cy.get('.mcs-OTQLConsoleContainer_right-tab');
  }

  @logGetter()
  get tabs() {
    return this.myself.find('.ant-tabs-nav-list');
  }

  @logGetter()
  get searchBar() {
    return this.myself.find('input');
  }

  @logFunction()
  clickCharts() {
    this.tabs.contains('Charts').click();
  }

  @logFunction()
  clickSchema() {
    this.tabs.contains('Schema').click();
  }

  @logFunction()
  clickOnChart(chartName: string) {
    this.search(chartName);
    this.myself.find('.mcs-charts-list-item').click();
  }

  @logFunction()
  shouldContain(field: string) {
    this.myself.should('contain', field);
  }

  @logFunction()
  shouldNotContain(field: string) {
    this.myself.should('not.contain', field);
  }

  @logFunction()
  search(str: string) {
    this.searchBar
      .filter(':visible')
      .type('{selectall}{backspace}{backspace}', { force: true })
      .type(str + '{Enter}');
  }
}

export default Visualizer;
