import HeaderMenu from '../../HeaderMenu';
import Page from '../../Page';
import OrganisationMenu from './OrganisationMenu';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class LabelsPage extends Page {
  label: string;

  constructor() {
    super();
    this.label = `label-${Math.random().toString(36).substring(2, 10)}`;
  }

  @logFunction()
  goToPage() {
    HeaderMenu.clickSettingsIcon();
    OrganisationMenu.clickLabels();
  }

  @logGetter()
  get btnNewLabel() {
    return cy.get('.mcs-card-button').contains('New Label');
  }

  @logGetter()
  get labelsTable() {
    return cy.get('.ant-table-container');
  }

  @logGetter()
  get labelsTableRows() {
    return cy.get('.ant-table-row');
  }

  @logGetter()
  get arrowDropDownMenu() {
    return cy.get('.ant-dropdown-trigger > .mcs-icon > .mcs-chevron');
  }

  @logGetter()
  get btnEdit() {
    return cy.get('.ant-dropdown-menu-item').contains('Edit');
  }

  @logGetter()
  get btnArchive() {
    return cy.get('.ant-dropdown-menu-item').contains('Archive');
  }

  @logGetter()
  get newLabelField() {
    return cy.get('.ant-modal-body > .ant-input');
  }

  @logGetter()
  get btnCancelAddPopUp() {
    return cy.get('.ant-modal').contains('Cancel');
  }

  @logGetter()
  get btnSaveAddPopUp() {
    return cy.get('.ant-modal').contains('Save');
  }

  @logGetter()
  get closeIcon() {
    return cy.get('.ant-modal-close-x');
  }

  @logGetter()
  get btnOKConfirmPopUp() {
    return cy.get('.ant-modal-confirm-body-wrapper').contains('OK');
  }

  @logGetter()
  get btnCancelConfirmPopUp() {
    return cy.get('.ant-modal-confirm-body-wrapper').contains('Cancel');
  }

  @logGetter()
  get alertMessage() {
    return cy.get('.ant-alert');
  }

  @logFunction()
  clickBtnNewLabel() {
    this.btnNewLabel.click();
  }

  @logFunction()
  clickDropDownArrowLabel(label: string) {
    return this.labelsTableRows.contains(label).parent().find('.mcs-chevron').click();
  }

  @logFunction()
  clickBtnEdit() {
    this.btnEdit.click();
  }

  @logFunction()
  clickBtnArchive() {
    this.btnArchive.click();
  }

  @logFunction()
  typeNewLabelField(newLabel: string = this.label) {
    this.newLabelField.clear().type(newLabel);
  }

  @logFunction()
  clickBtnCancel() {
    this.btnCancelAddPopUp.click();
  }

  @logFunction()
  clickBtnSave() {
    this.btnSaveAddPopUp.click();
  }

  @logFunction()
  closeNewLabelPopUp() {
    this.closeIcon.click();
  }

  @logFunction()
  clickBtnOKConfirmPopUp() {
    this.btnOKConfirmPopUp.click();
  }

  @logFunction()
  clickBtnCancelConfirmPopUp() {
    this.btnCancelConfirmPopUp.click();
  }

  @logFunction()
  addNewLabel(label: string = this.label) {
    this.clickBtnNewLabel();
    this.typeNewLabelField(label);
    this.clickBtnSave();
  }
}

export default LabelsPage;
