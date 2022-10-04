import Page from '../../Page';
import LeftMenu from '../../LeftMenu';
import SaveChartPopUp from './SaveChartPopUp';
import RightTab from './RightTab';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class QueryToolPage extends Page {
  public query: string;
  public queryId: number;
  public rightTab: RightTab;
  public saveChartPopUp: SaveChartPopUp;

  constructor() {
    super();
    this.saveChartPopUp = new SaveChartPopUp();
    this.rightTab = new RightTab();
    this.query = '';
    this.queryId = 0;
  }

  @logFunction()
  goToPage() {
    LeftMenu.clickDataStudioMenu();
    LeftMenu.clickDataStudioQuerryTool();
  }

  @logGetter()
  get consoleContainer() {
    return cy.get('.mcs-OTQLConsoleContainer_tabs');
  }

  @logGetter()
  get resultsArea() {
    const re = /@count/;
    var selector = '.mcs-dashboardMetric';
    // query does not contain count
    if (re.exec(this.query) === null) {
      selector = '.mcs-otqlQuery_result_json';
    }
    return cy.get(selector, { timeout: 60000 });
  }

  @logGetter()
  get btnAddQuery() {
    return cy.get('.mcs-OTQLConsoleContainer_tabs').find('.ant-tabs-nav-add').eq(1);
  }

  @logFunction()
  clickBtnAddQuery() {
    this.btnAddQuery.click({ force: true });
  }

  @logGetter()
  get btnRemoveQuery() {
    return cy.get('.mcs-OTQLConsoleContainer_tabs').find('.ant-tabs-tab-remove').eq(1);
  }

  @logFunction()
  clickBtnRemoveQuery() {
    this.btnRemoveQuery.click({ force: true });
  }

  @logGetter()
  get btnSave() {
    return cy.get('.mcs-otqlInputEditor_save_button');
  }

  @logGetter()
  get saveAsButton() {
    return cy.get('.mcs-otqlInputEditor_save_as_button');
  }

  @logGetter()
  get alertMessage() {
    return cy.get('.ant-alert-message', { timeout: 60000 }).filter(':visible');
  }

  @logGetter()
  get alertMessageCloseButton() {
    return cy.get('.ant-alert-close-icon').filter(':visible');
  }

  @logFunction()
  closeAlertMessage() {
    this.alertMessageCloseButton.click();
  }

  @logFunction()
  getQueryId() {
    this.queryId = 0;
    this.clickSaveAsTechnicalQuery();
    this.alertMessage.invoke('text').then(text => {
      var pattern = /[0-9]+/g;
      var result = text.match(pattern);
      if (result !== null) {
        this.queryId = result[0];
      }
      expect(this.queryId).to.not.equal(0);
      cy.log('Query id: ' + this.queryId);
    });
    this.closeAlertMessage();
    return this.queryId;
  }

  @logFunction()
  clickBtnSave() {
    this.btnSave.click();
  }

  @logFunction()
  clickSaveAsTechnicalQuery() {
    this.clickSaveAsGeneric('Technical query');
  }

  @logFunction()
  clickSaveAsUserQuerySegment() {
    this.clickSaveAsGeneric('User Query Segment');
  }

  @logFunction()
  private clickSaveAsGeneric(pattern: string) {
    this.saveAsButton.click();
    cy.get('.ant-dropdown-menu').then($element => {
      cy.wait(1000);
      cy.get('.ant-dropdown-menu').contains(pattern).click();
    });
  }

  @logGetter()
  get btnShare() {
    return cy.get('.mcs-otqlChart_items_share_button');
  }

  @logFunction()
  clickBtnShare() {
    this.btnShare.click();
  }

  @logGetter()
  get successNotification() {
    return cy.get('.ant-notification-notice-success');
  }

  @logGetter()
  get pieContent() {
    return cy.get('.mcs-otqlChart_content_pie');
  }

  @logGetter()
  get resultMetrics() {
    return cy.get('.mcs-otqlChart_resultMetrics');
  }

  @logGetter()
  get chartContainer() {
    return cy.get('.mcs-chart_content_container');
  }

  @logGetter()
  get barContent() {
    return cy.get('.mcs-otqlChart_content_bar');
  }

  @logGetter()
  get radarContent() {
    return cy.get('.mcs-otqlChart_content_radar');
  }

  @logGetter()
  get schemaVizualize() {
    return cy.get('.mcs-schemaVizualize_content');
  }

  @logGetter()
  get tableContainer() {
    return cy.get('.mcs-table-container');
  }

  @logFunction()
  clickBtnRun() {
    cy.get('.mcs-otqlInputEditor_run_button').eq(0).click();
  }

  @logFunction()
  executeQuery(query: string = '') {
    // if no query is pass as argument, simply run the current query
    //cy.get('.mcs-otqlInputEditor_run_button').eq(0).click();
    if (query !== '') {
      this.typeQuery(query);
    }
    cy.get('.mcs-otqlInputEditor_run_button').filter(':visible').click();
  }

  @logFunction()
  clickBarIcon() {
    cy.get('.mcs-otqlChart_icons_bar').click();
  }

  @logFunction()
  clickPercentageOption() {
    cy.get('.mcs-otqlChart_items_quick_option').eq(1).click();
    cy.get('.mcs-chartOptions_percentage').click();
  }

  @logFunction()
  clickIndexOption() {
    cy.get('.mcs-otqlChart_items_quick_option').eq(1).click();
    cy.get('.mcs-chartOptions_index').click();
  }

  @logFunction()
  clickRadarIcon() {
    cy.get('.mcs-otqlChart_icons_radar').click();
  }

  @logFunction()
  clickPieIcon() {
    cy.get('.mcs-otqlChart_icons_pie').click();
  }

  @logFunction()
  typeQuery(query: string, pos: number = 0) {
    // FIXME pos is not use anymore
    this.query = query;
    cy.get('.mcs-otqlInputEditor_otqlConsole')
      .filter(':visible')
      .within(() => {
        cy.get('textarea')
          .type('{selectall}{backspace}{backspace}', { force: true })
          .type(query, { force: true, parseSpecialCharSequences: false });
      });
  }

  @logFunction()
  resultsShouldContain(result: string) {
    this.resultsArea.should('contain', result);
  }

  @logFunction()
  addTab() {
    cy.get('.ant-tabs-nav-add').filter(':visible').last().click();
    cy.wait(500);
  }

  @logFunction()
  selectTab(id: number) {
    // first tab has 0 index
    id = id - 1;
    cy.get('.ant-tabs-tab').eq(id).click();
  }

  @logFunction()
  schemaShouldContain(field: string) {
    cy.get('.ant-tree-list').should('contain', field);
  }
}

export default QueryToolPage;
