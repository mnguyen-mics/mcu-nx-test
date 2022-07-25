import Page from '../Page';
import LeftMenu from '../LeftMenu';
import ImportsInformation from './ImportsInformation';
import { logFunction, logGetter } from '../log/LoggingDecorator';

class ImportsPage extends Page {
  importsInformation: ImportsInformation;

  constructor() {
    super();
    this.importsInformation = new ImportsInformation();
  }

  @logFunction()
  goToPage() {
    LeftMenu.clickDataStudioMenu();
    LeftMenu.clickLibraryImports();
  }

  @logGetter()
  get titleImport() {
    return cy.get('.mcs-contentHeader_title--large');
  }

  @logGetter()
  get importExecutionTable() {
    return cy.get('.mcs-importExecution_table');
  }

  @logGetter()
  get notificationNotice() {
    return cy.get('.ant-notification-notice-with-icon');
  }

  @logFunction()
  clickBtnImportsCreation() {
    cy.get('.mcs-imports_creationButton').click();
  }

  @logFunction()
  goToImportExecutions(importName: string) {
    cy.get('.mcs-search-input').type(importName);
    cy.get('.mcs-search-input').type('{enter}');
    cy.wait(100);
    cy.get('.mcs-campaigns-link').click();
  }

  @logFunction()
  clickBtnNewExecution() {
    cy.get('.mcs-importExecution_newExecution').click();
  }

  @logFunction()
  clickBtnEdit() {
    cy.get('.mcs-icon').contains('Edit').click();
  }

  @logFunction()
  clickDelete() {
    cy.get('.ant-dropdown-trigger').click().contains('Delete').click();
  }

  @logFunction()
  clickOK() {
    cy.contains('Ok').click();
  }
}

export default ImportsPage;
