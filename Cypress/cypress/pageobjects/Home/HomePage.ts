import Page from './../Page';
import DataInformationPage from './DataInformationPage';

class HomePage extends Page {
  dataInformationPage: DataInformationPage;

  constructor() {
    super();
    this.dataInformationPage = new DataInformationPage();
  }

  goToPage() {
    cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.home').click();
  }

  get dashboardPageContainer() {
    return cy.get('.mcs-content-container');
  }

  get sectionDashboard() {
    return cy.get('.mcs-card_content');
  }

  get dashboardPageWrapper() {
    return cy.get('.mcs-homePage_dashboard_page_wrapper');
  }

  clickChartsTypesDashboard() {
    cy.get('.mcs-tabs_tab').contains('Charts types dashboard').click();
  }

  clickLoadingExperience() {
    cy.get('.mcs-tabs_tab').contains('Loading Experience').click();
  }

  clickIndexTransformation() {
    cy.contains('Index Transformation').click();
  }

  clickBtnBars() {
    cy.contains('Bars').click();
  }

  clickBtnAddStep() {
    cy.get('.mcs-timelineStepBuilder_addStepBtn').click();
  }

  clickBtnStepName() {
    cy.get('.mcs-otqlInputEditor_stepNameButton').eq(1).click();
  }

  clickBtnNewValue() {
    cy.get('.mcs-otqlSeries_newValue').click();
  }

  typeNameStep(name: string) {
    cy.get('.mcs-otqlInputEditor_stepNameInput').clear().type(name);
  }
}

export default HomePage;
