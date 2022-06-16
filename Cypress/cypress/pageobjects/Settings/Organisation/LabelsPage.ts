import HeaderMenu from '../../HeaderMenu';
import Page from '../../Page';
import OrganisationMenu from './OrganisationMenu';

class LabelsPage extends Page {
  label: string;

  constructor() {
    super();
    this.label = `label-${Math.random().toString(36).substring(2, 10)}`;
  }

  goToPage() {
    HeaderMenu.clickSettingsIcon();
    OrganisationMenu.clickLabels();
  }

  get btnNewLabel() {
    return cy.get('.mcs-card-button').contains('New Label');
  }

  get labelsTable() {
    return cy.get('.ant-table-row');
  }

  get arrowDropDownMenu() {
    return cy.get('.ant-dropdown-trigger > .mcs-icon > .mcs-chevron');
  }

  get btnEdit() {
    return cy.get('.ant-dropdown-menu-item').contains('Edit');
  }

  get btnArchive() {
    return cy.get('.ant-dropdown-menu-item').contains('Archive');
  }

  get newLabelField() {
    return cy.get('.ant-modal-body > .ant-input');
  }

  get btnCancelAddPopUp() {
    return cy.get('.ant-modal').contains('Cancel');
  }

  get btnSaveAddPopUp() {
    return cy.get('.ant-modal').contains('Save');
  }

  get closeIcon() {
    return cy.get('.ant-modal-close-x');
  }

  get btnOKConfirmPopUp() {
    return cy.get('.ant-modal-confirm-body-wrapper').contains('OK');
  }

  get btnCancelConfirmPopUp() {
    return cy.get('.ant-modal-confirm-body-wrapper').contains('Cancel');
  }

  get alertMessage() {
    return cy.get('.ant-alert');
  }

  clickBtnNewLabel() {
    this.btnNewLabel.click();
  }

  clickLastArrowDropDownMenu() {
    this.arrowDropDownMenu.last().click();
  }

  clickBtnEdit() {
    this.btnEdit.click();
  }

  clickBtnArchive() {
    this.btnArchive.click();
  }

  typeNewLabelField(newLabel: string = this.label) {
    this.newLabelField.clear().type(newLabel);
  }

  clickBtnCancel() {
    this.btnCancelAddPopUp.click();
  }

  clickBtnSave() {
    this.btnSaveAddPopUp.click();
  }

  closeNewLabelPopUp() {
    this.closeIcon.click();
  }

  clickBtnOKConfirmPopUp() {
    this.btnOKConfirmPopUp.click();
  }

  clickBtnCancelConfirmPopUp() {
    this.btnCancelConfirmPopUp.click();
  }

  addNewLabel(label: string = this.label) {
    this.clickBtnNewLabel();
    this.typeNewLabelField(label);
    this.clickBtnSave();
  }
}

export default LabelsPage;
