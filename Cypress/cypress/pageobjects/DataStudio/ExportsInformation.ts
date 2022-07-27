import Page from '../Page';
import { logFunction, logGetter } from '../log/LoggingDecorator';

class ExportsInformation extends Page {
  constructor() {
    super();
  }

  @logGetter()
  get btnSaveExport() {
    return cy.get('.mcs-form_saveButton_exportForm');
  }

  @logFunction()
  clickBtnSaveExport() {
    this.btnSaveExport.click();
  }

  @logFunction()
  typeExportName(exportName: string) {
    cy.get('.mcs-exports_exportName').type(exportName);
  }

  @logFunction()
  typeQuery(query: string) {
    cy.get('.mcs-otql').type(query, {
      parseSpecialCharSequences: false,
    });
  }
}

export default ExportsInformation;
