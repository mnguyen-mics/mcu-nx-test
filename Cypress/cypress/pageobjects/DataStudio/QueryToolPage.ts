import Page from '../Page';
import LeftMenu from '../LeftMenu';

class QueryToolPage extends Page {
  constructor() {
    super();
  }
  goToPage() {
    LeftMenu.clickDataStudioMenu();
    LeftMenu.clickDataStudioQuerryTool();
  }

  get pieContent() {
    return cy.get('.mcs-otqlChart_content_pie');
  }

  get resultMetrics() {
    return cy.get('.mcs-otqlChart_resultMetrics');
  }

  get chartContainer() {
    return cy.get('.mcs-chart_content_container');
  }

  get barContent() {
    return cy.get('.mcs-otqlChart_content_bar');
  }

  get radarContent() {
    return cy.get('.mcs-otqlChart_content_radar');
  }

  clickBtnRun() {
    cy.get('.mcs-otqlInputEditor_run_button').click();
  }

  clickBarIcon() {
    cy.get('.mcs-otqlChart_icons_bar').click();
  }

  clickPercentageOption() {
    cy.get('.mcs-otqlChart_items_quick_option').eq(1).click();
    cy.get('.mcs-chartOptions_percentage').click();
  }

  clickIndexOption() {
    cy.get('.mcs-otqlChart_items_quick_option').eq(1).click();
    cy.get('.mcs-chartOptions_index').click();
  }

  clickRadarIcon() {
    cy.get('.mcs-otqlChart_icons_radar').click();
  }

  clickPieIcon() {
    cy.get('.mcs-otqlChart_icons_pie').click();
  }

  typeQuerry(querry: string) {
    cy.get('.mcs-otqlInputEditor_otqlConsole > textarea')
      .type('{selectall}{backspace}{backspace}', {
        force: true,
      })
      .type(querry, { force: true, parseSpecialCharSequences: false });
  }
}

export default QueryToolPage;
