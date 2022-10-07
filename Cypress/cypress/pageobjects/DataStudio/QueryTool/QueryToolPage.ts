import Page from '../../Page';
import LeftMenu from '../../LeftMenu';
import SaveChartPopUp from './SaveChartPopUp';
import SaveAsUserQuerySegmentPopUp from './SaveAsUserQuerySegmentPopUp';
import ExportPopUp from './ExportPopUp';
import RightTab from './RightTab';
import Tab from './Tab';
import SchemaVisualizer from './SchemaVisualizer';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class QueryToolPage extends Page {
  public exportPopUp: ExportPopUp;
  public query: string;
  public queryId: number;
  public rightTab: RightTab;
  public saveAsUserQuerySegmentPopUp: SaveAsUserQuerySegmentPopUp;
  public saveChartPopUp: SaveChartPopUp;
  public tab: Tab;
  public schemaVisualizer: SchemaVisualizer;

  constructor() {
    super();
    this.exportPopUp = new ExportPopUp();
    this.query = '';
    this.queryId = 0;
    this.rightTab = new RightTab();
    this.saveAsUserQuerySegmentPopUp = new SaveAsUserQuerySegmentPopUp();
    this.saveChartPopUp = new SaveChartPopUp();
    this.tab = new Tab();
    this.schemaVisualizer = new SchemaVisualizer();
  }

  @logGetter()
  get consoleContainer() {
    return cy.get('.mcs-OTQLConsoleContainer_tabs');
  }

  @logGetter()
  get areaResult() {
    const reCount = /@count/;
    const reCardinality = /@[Cc]ardinality/;
    var selector = '.mcs-otqlQuery_result_json';
    // query does not contain count
    if (reCount.exec(this.query) !== null) {
      selector = '.mcs-dashboardMetric';
    }
    if (reCardinality.exec(this.query) !== null) {
      selector = '.mcs-aggregationRendered_table';
    }
    return cy.get(selector, { timeout: 60000 });
  }

  @logGetter()
  get areaAlertMessage() {
    return cy.get('.ant-alert-message', { timeout: 60000 }).filter(':visible');
  }

  @logGetter()
  get alertMessage() {
    return this.areaAlertMessage;
  }

  @logGetter()
  get btnCloseAlertMessage() {
    return cy.get('.ant-alert-close-icon').filter(':visible');
  }

  @logGetter()
  get btnRemoveQuery() {
    return cy.get('.mcs-OTQLConsoleContainer_tabs').find('.ant-tabs-tab-remove').eq(1);
  }

  @logGetter()
  get btnSave() {
    return cy.get('.mcs-otqlInputEditor_save_button');
  }

  @logGetter()
  get btnSaveAs() {
    return cy.get('.mcs-otqlInputEditor_save_as_button');
  }

  @logGetter()
  get saveAsButton() {
    return this.btnSaveAs;
  }

  @logGetter()
  get alertMessageCloseButton() {
    return cy.get('.ant-alert-close-icon').filter(':visible');
  }

  @logGetter()
  get btnShare() {
    return cy.get('.mcs-otqlChart_items_share_button');
  }

  @logGetter()
  get barContent() {
    return cy.get('.mcs-otqlChart_content_bar');
  }

  @logGetter()
  get chartContainer() {
    return cy.get('.mcs-chart_content_container');
  }

  @logGetter()
  get pieContent() {
    return cy.get('.mcs-otqlChart_content_pie');
  }

  @logGetter()
  get radarContent() {
    return cy.get('.mcs-otqlChart_content_radar');
  }

  @logGetter()
  get resultMetrics() {
    return cy.get('.mcs-otqlChart_resultMetrics');
  }

  @logGetter()
  get successNotification() {
    return cy.get('.ant-notification-notice-success');
  }

  @logGetter()
  get tableContainer() {
    return cy.get('.mcs-table-container');
  }

  @logFunction()
  clickBarIcon() {
    cy.get('.mcs-otqlChart_icons_bar').click();
  }

  @logFunction()
  clickBtnRemoveQuery() {
    this.btnRemoveQuery.click({ force: true });
  }

  @logFunction()
  clickBtnShare() {
    this.btnShare.click();
  }

  @logFunction()
  clickBtnSave() {
    this.btnSave.click();
  }

  private clickSaveAsGeneric(pattern: string) {
    this.btnSaveAs.click();
    cy.get('.ant-dropdown-menu').then($element => {
      cy.wait(1000);
      cy.get('.ant-dropdown-menu').contains(pattern).click();
    });
  }

  @logFunction()
  clickSaveAsExport() {
    this.clickSaveAsGeneric('Export');
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
  closeAlertMessage() {
    this.btnCloseAlertMessage.click();
  }

  // click functions
  @logFunction()
  clickBtnRun() {
    cy.get('.mcs-otqlInputEditor_run_button').filter(':visible').click();
  }

  @logFunction()
  getQueryId() {
    this.queryId = 0;
    this.clickSaveAsTechnicalQuery();
    this.areaAlertMessage.invoke('text').then(text => {
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
  goToPage() {
    LeftMenu.clickDataStudioMenu();
    LeftMenu.clickDataStudioQuerryTool();
  }

  @logFunction()
  alertErrorIsPresent() {
    cy.get('.ant-alert-error', { timeout: 20000 }).filter(':visible').should('exist');
  }

  @logFunction()
  alertErrorIsMissing() {
    cy.get('.ant-alert-error', { timeout: 20000 }).should('not.exist');
  }

  // Advanced functionS
  @logFunction()
  executeQuery(query: string = '') {
    // if no query is pass as argument, simply run the current query
    //cy.get(".mcs-otqlInputEditor_run_button").eq(0).click();
    if (query !== '') {
      this.typeQuery(query);
    }
    this.clickBtnRun();
  }

  @logFunction()
  resultsShouldContain(result: string) {
    this.areaResult.should('contain', result);
  }
}

export default QueryToolPage;
