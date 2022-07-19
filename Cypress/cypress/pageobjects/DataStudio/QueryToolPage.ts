import Page from '../Page';
import LeftMenu from '../LeftMenu';
import { logFunction, logGetter } from '../log/LoggingDecorator';

class QueryToolPage extends Page {
  constructor() {
    super();
  }

  @logFunction()
  goToPage() {
    LeftMenu.clickDataStudioMenu();
    LeftMenu.clickDataStudioQuerryTool();
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

  @logFunction()
  clickBtnRun() {
    cy.get('.mcs-otqlInputEditor_run_button').click();
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
