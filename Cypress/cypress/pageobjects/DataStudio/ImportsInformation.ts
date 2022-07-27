import Page from '../Page';
import { logFunction, logGetter } from '../log/LoggingDecorator';

class ImportsInformation extends Page {
  constructor() {
    super();
  }

  @logGetter()
  get btnSaveImport() {
    return cy.get('.mcs-form_saveButton_importForm');
  }

  @logFunction()
  clickBtnSaveImport() {
    this.btnSaveImport.click();
  }

  @logFunction()
  typeImportName(importName: string) {
    cy.get('.mcs-imports_nameField').type(importName);
  }

  @logFunction()
  selectUserSegmentDocumentType() {
    cy.get(
      '.mcs-imports_selectField_edit\\.import\\.general\\.infos\\.tooltip\\.documentType',
    ).click();
    cy.get('.mcs-select_itemOption--user-segment').click();
  }

  @logFunction()
  selectUserActivityDocumentType() {
    cy.get(
      '.mcs-imports_selectField_edit\\.import\\.general\\.infos\\.tooltip\\.documentType',
    ).click();
    cy.get('.mcs-select_itemOption--user-activity').click();
  }

  @logFunction()
  selectUserProfileDocumentType() {
    cy.get(
      '.mcs-imports_selectField_edit\\.import\\.general\\.infos\\.tooltip\\.documentType',
    ).click();
    cy.get('.mcs-select_itemOption--user-profile').click();
  }

  @logFunction()
  selectUserChoiceDocumentType() {
    cy.get(
      '.mcs-imports_selectField_edit\\.import\\.general\\.infos\\.tooltip\\.documentType',
    ).click();
    cy.get('.mcs-select_itemOption--user-choice').click();
  }

  @logFunction()
  selectUserAssociationDocumentType() {
    cy.get(
      '.mcs-imports_selectField_edit\\.import\\.general\\.infos\\.tooltip\\.documentType',
    ).click();
    cy.get('.mcs-select_itemOption--user-identifiers-association-declarations').click();
  }

  @logFunction()
  selectUserDissociationDocumentType() {
    cy.get(
      '.mcs-imports_selectField_edit\\.import\\.general\\.infos\\.tooltip\\.documentType',
    ).click();
    cy.get('.mcs-select_itemOption--user-identifiers-dissociation-declarations').click();
  }

  @logFunction()
  selectUserDeletionDocumentType() {
    cy.get(
      '.mcs-imports_selectField_edit\\.import\\.general\\.infos\\.tooltip\\.documentType',
    ).click();
    cy.get('.mcs-select_itemOption--user-identifiers-deletion').click();
  }

  @logFunction()
  selectImportType(importType: string | number | RegExp) {
    cy.get(
      '.mcs-imports_selectField_edit\\.import\\.general\\.infos\\.tooltip\\.documentType',
    ).click();
    cy.contains(importType).click();
  }

  @logFunction()
  selectLowPriority() {
    cy.get('.mcs-imports_selectField_edit\\.import\\.general\\.infos\\.tooltip\\.priority').click();
    cy.get('.mcs-select_itemOption--low').click();
  }

  @logFunction()
  selectMediumPriority() {
    cy.get('.mcs-imports_selectField_edit\\.import\\.general\\.infos\\.tooltip\\.priority').click();
    cy.get('.mcs-select_itemOption--medium').click();
  }

  @logFunction()
  selectHighPriority() {
    cy.get('.mcs-imports_selectField_edit\\.import\\.general\\.infos\\.tooltip\\.priority').click();
    cy.get('.mcs-select_itemOption--high').click();
  }

  @logFunction()
  selectPriority(priorityLevel: string) {
    cy.get('.mcs-imports_selectField_edit\\.import\\.general\\.infos\\.tooltip\\.priority').click();
    cy.contains(priorityLevel).click();
  }
}

export default ImportsInformation;
