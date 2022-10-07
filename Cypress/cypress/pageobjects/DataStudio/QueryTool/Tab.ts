import Page from '../../Page';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class Tab extends Page {
  public query: string;
  public activeTab: number;

  constructor() {
    super();
    this.query = '';
    this.activeTab = 1;
  }

  get myself() {
    return cy.get('.mcs-OTQLConsoleContainer_tabs');
  }

  @logGetter()
  get btnAdd() {
    return this.myself.find('.ant-tabs-nav-add').filter(':visible').last();
  }

  @logFunction()
  clickAdd() {
    this.btnAdd.click();
    this.activeTab += 1;
    cy.wait(500);
  }

  @logFunction()
  select(id: number) {
    // first tab has 0 index
    id = id - 1;
    this.myself.find('.ant-tabs-tab').eq(id).click();
    this.activeTab = id;
  }

  @logFunction()
  resultsAreaByTab(tabIndex: number) {
    const re = /@count/;
    let selector = '.mcs-dashboardMetric';
    // query does not contain count
    if (re.exec(this.query) === null) {
      selector = '.mcs-otqlQuery_result_json';
    }
    return this.getTabPanel(tabIndex).find(selector, { timeout: 60000 });
  }

  @logFunction()
  schemaVizualizeByTab(tabIndex: number) {
    return this.getTabPanel(tabIndex).find('.mcs-schemaVizualize_content');
  }

  @logFunction()
  clickBtnRun(tabIndex?: number) {
    this.getTabPanel(!!tabIndex ? tabIndex : 0)
      .find('.mcs-otqlInputEditor_run_button')
      .eq(0)
      .click();
  }

  @logFunction()
  getActiveTabPanel() {
    return cy.get(`ant-tabs-tab-active`).eq(0);
  }

  @logFunction()
  clickOnTab(tabIndex: number) {
    cy.get('.mcs-OTQLConsoleContainer_tabs').find(`.ant-tabs-tab-with-remove`).eq(tabIndex).click();
  }

  @logFunction()
  alertErrorIsPresentOnTab(tabIndex: number) {
    this.getTabPanel(tabIndex).find('.ant-alert-error', { timeout: 20000 }).should('exist'); // .its('length').should('eq', 1);
  }

  @logFunction()
  alertErrorIsMissingOnTab(tabIndex: number) {
    this.getTabPanel(tabIndex).find('.ant-alert-error', { timeout: 20000 }).should('not.exist'); // .its('length').should('eq', 0);
  }

  @logFunction()
  resultMetricsByTab(tabIndex: number) {
    return this.getTabPanel(tabIndex).find('.mcs-otqlChart_resultMetrics');
  }

  @logFunction()
  resultsShouldContainByTab(result: string, tabIndex: number) {
    this.resultsAreaByTab(tabIndex).should('contain', result);
  }

  @logFunction()
  resultsAreaShouldContain(result: string, tabIndex: number) {
    const re = /@count/;
    let selector = '.mcs-dashboardMetric';
    // query does not contain count
    if (re.exec(this.query) === null) {
      selector = '.mcs-otqlQuery_result_json';
    }
    this.getTabPanel(tabIndex).find(selector, { timeout: 60000 }).should('contain', result);
  }

  @logFunction()
  getTabPanel(tabIndex: number) {
    return cy.get(`div[id="rc-tabs-1-panel-${tabIndex + 1}"]`);
  }
}

export default Tab;
