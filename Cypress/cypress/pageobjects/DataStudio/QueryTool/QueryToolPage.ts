import Page from '../../Page';
import LeftMenu from '../../LeftMenu';
import SaveChartPopUp from './SaveChartPopUp';
import RightTab from './RightTab';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class QueryToolPage extends Page {
  saveChartPopUp: SaveChartPopUp;
  rightTab: RightTab;

  constructor() {
    super();
    this.saveChartPopUp = new SaveChartPopUp();
    this.rightTab = new RightTab();
  }

  @logFunction()
  goToPage() {
    LeftMenu.clickDataStudioMenu();
    LeftMenu.clickDataStudioQuerryTool();
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

  @logFunction()
  clickBtnSave() {
    this.btnSave.click();
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
  clickBtnRun(pos: number) {
    cy.get('.mcs-otqlInputEditor_run_button').eq(pos).click();
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
  typeQuery(query: string, pos: number) {
    cy.get('.mcs-otqlInputEditor_otqlConsole > textarea')
      .eq(pos)
      .type('{selectall}{backspace}{backspace}', {
        force: true,
      })
      .type(query, { force: true, parseSpecialCharSequences: false });
  }
}

export default QueryToolPage;
