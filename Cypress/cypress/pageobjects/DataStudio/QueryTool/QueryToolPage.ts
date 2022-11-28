import Charts from './Charts';
import ExportPopUp from './ExportPopUp';
import LeftMenu from '../../LeftMenu';
import Page from '../../Page';
import RightTab from './RightTab';
import SaveAsUserQuerySegmentPopUp from './SaveAsUserQuerySegmentPopUp';
import SaveChartPopUp from './SaveChartPopUp';
import SchemaVisualizer from './SchemaVisualizer';
import Tab from './Tab';
import Visualizer from './Visualizer';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class QueryToolPage extends Page {
  public charts: Charts;
  public exportPopUp: ExportPopUp;
  public query: string;
  public queryId: number;
  public rightTab: RightTab;
  public saveAsUserQuerySegmentPopUp: SaveAsUserQuerySegmentPopUp;
  public saveChartPopUp: SaveChartPopUp;
  public schemaVisualizer: SchemaVisualizer;
  public tab: Tab;
  public visualizer: Visualizer;

  constructor() {
    super();
    this.charts = new Charts();
    this.exportPopUp = new ExportPopUp();
    this.query = '';
    this.queryId = 0;
    this.rightTab = new RightTab();
    this.saveAsUserQuerySegmentPopUp = new SaveAsUserQuerySegmentPopUp();
    this.saveChartPopUp = new SaveChartPopUp();
    this.schemaVisualizer = new SchemaVisualizer();
    this.tab = new Tab();
    this.visualizer = new Visualizer();
  }

  @logGetter()
  get consoleContainer() {
    return cy.get('.mcs-OTQLConsoleContainer_tabs');
  }

  @logGetter()
  get areaResult() {
    const reCount = /@count/;
    const reCardinality = /(@[Cc]ardinality|@map)/;
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
  clickBtnRemoveQuery() {
    this.btnRemoveQuery.click({ force: true });
  }

  @logFunction()
  clickBtnShare() {
    this.btnShare.click();
    cy.wait(1000);
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
  typeQuery(query: string, pos: number = -1) {
    let selector = '.mcs-otqlInputEditor_otqlConsole';
    if (pos >= 0) {
      selector = '.mcs-queryToolSeries_mainStep';
    } else {
      pos = 0;
    }
    cy.get(selector)
      .filter(':visible')
      .find('textarea')
      .eq(pos)
      .type('{selectall}{backspace}{backspace}', { force: true })
      .type(query, { force: true, parseSpecialCharSequences: false });
    this.query = query;
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
    this.areaResult;
  }

  @logFunction()
  resultsShouldContain(result: string) {
    this.areaResult.should('contain', result);
  }

  @logFunction()
  getSeries() {
    return this.tab.activeTabPanel.find('.mcs-queryToolSeries_mainStep');
  }

  @logFunction()
  getQueriesForSeries(seriesIndex: number) {
    return this.getSeries().eq(seriesIndex).find('.mcs-otqlInputEditor_otqlConsole');
  }

  @logFunction()
  getSeriesTitleButtonsWithinSeries(seriesIndex: number) {
    return this.getSeries()
      .eq(seriesIndex)
      .children()
      .filter('.mcs-otqlInputEditor_stepNameButton');
  }

  @logFunction()
  getSeriesSubStep(seriesIndex: number) {
    return this.getSeries().eq(seriesIndex).find('.mcs-queryToolSeries_subStep', { timeout: 2000 });
  }

  @logFunction()
  getDimensionTitleButtonsWithinSeries(seriesIndex: number) {
    return this.getSeriesSubStep(seriesIndex)
      .children()
      .filter('.mcs-otqlInputEditor_stepNameButton');
  }

  @logFunction()
  getNewValueButtonWithinSeries(seriesIndex: number) {
    return this.getSeries().eq(seriesIndex).find('.mcs-queryToolSeries_newValue');
  }

  @logFunction()
  getSeriesDeleteButtons(seriesIndex: number) {
    return this.getSeries().eq(seriesIndex).children().filter('.mcs-queryToolSeries_removeStepBtn');
  }

  @logFunction()
  getDimensionDeleteButtonsWithinSeries(seriesIndex: number) {
    return this.getSeriesSubStep(seriesIndex)
      .children()
      .filter('.mcs-queryToolSeries_removeStepBtn');
  }

  @logFunction()
  clickAddStep() {
    cy.get('.mcs-timelineStepBuilder_addStepBtn').click();
    this.charts.multisteps = 1;
  }
}

export default QueryToolPage;
