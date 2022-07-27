import Page from '../Page';
import LeftMenu from '../LeftMenu';
import ExportsInformation from './ExportsInformation';
import { logFunction } from '../log/LoggingDecorator';

class ExportsPage extends Page {
  exportsInformation: ExportsInformation;

  constructor() {
    super();
    this.exportsInformation = new ExportsInformation();
  }

  @logFunction()
  goToPage() {
    LeftMenu.clickDataStudioMenu();
    LeftMenu.clickLibraryExports();
  }

  @logFunction()
  clickBtnExportsCreation() {
    cy.get('.mcs-exports_creationButton').click();
  }

  @logFunction()
  clickExportsLink() {
    cy.get('.mcs-breadcrumb_exportsLink').click();
  }

  @logFunction()
  goToExportExecutions(exportName: string) {
    cy.get('.mcs-search-input').type(exportName);
    cy.get('.mcs-search-input').type('{enter}');
    cy.wait(100);
    cy.get('.mcs-campaigns-link').click();
  }

  @logFunction()
  clickBtnNewExecution() {
    cy.get('.mcs-primary').contains('New Execution').click();
  }

  @logFunction()
  clickBtnEdit() {
    cy.get('.mcs-icon').contains('Edit').click();
  }

  @logFunction()
  clickBtnDownloadMessage() {
    cy.get('.mcs-export-button-download-message').click();
  }

  @logFunction()
  clickHistory() {
    cy.get('.ant-dropdown-open').click().contains('History').click();
  }

  @logFunction()
  clickArchive() {
    cy.get('.ant-dropdown-open').click().contains('Archive').click();
  }
}

export default ExportsPage;
