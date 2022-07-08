import Page from './../Page';
import DataInformationPage from './DataInformationPage';
import { logFunction, logGetter } from '../log/LoggingDecorator';

class HomePage extends Page {
  dataInformationPage: DataInformationPage;

  constructor() {
    super();
    this.dataInformationPage = new DataInformationPage();
  }

  @logFunction()
  goToPage() {
    cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.home').click();
  }

  @logGetter()
  get dashboardPageContainer() {
    return cy.get('.mcs-content-container');
  }

  @logGetter()
  get sectionDashboard() {
    return cy.get('.mcs-card_content');
  }

  @logGetter()
  get dashboardPageWrapper() {
    return cy.get('.mcs-homePage_dashboard_page_wrapper');
  }

  @logFunction()
  clickChartsTypesDashboard() {
    cy.get('.mcs-tabs_tab').contains('Charts types dashboard').click();
  }

  @logFunction()
  clickLoadingExperience() {
    cy.get('.mcs-tabs_tab').contains('Loading Experience').click();
  }

  @logFunction()
  clickIndexTransformation() {
    cy.contains('Index Transformation').click();
  }

  @logFunction()
  clickBtnBars() {
    cy.contains('Bars').click();
  }

  @logFunction()
  clickBtnAddStep() {
    cy.get('.mcs-timelineStepBuilder_addStepBtn').click();
  }

  @logFunction()
  clickBtnStepName() {
    cy.get('.mcs-otqlInputEditor_stepNameButton').eq(1).click();
  }

  @logFunction()
  clickBtnNewValue() {
    cy.get('.mcs-otqlSeries_newValue').click();
  }

  @logFunction()
  typeNameStep(name: string) {
    cy.get('.mcs-otqlInputEditor_stepNameInput').clear().type(name);
  }
}

export default HomePage;
