import HeaderMenu from '../../HeaderMenu';
import Page from '../../Page';
import OrganisationMenu from './OrganisationMenu';

class LabelsPage extends Page {
  goToLabelsPage() {
    HeaderMenu.clickSettingsIcon();
    OrganisationMenu.clickLabels();
  }

  get btnNewLabel() {
    return cy.contains('New Label');
  }

  get labelsTable() {
    return cy.get('.ant-spin-container');
  }

  get arrowDropDownMenu() {
    return cy.get('.ant-dropdown-trigger > .mcs-icon > .mcs-chevron', { timeout: 3000 });
  }

  get btnEdit() {
    return cy.contains('Edit');
  }

  get btnArchive() {
    return cy.contains('Archive');
  }

  get newLabelField() {
    return cy.get('.ant-modal-body > .ant-input');
  }

  get btnCancel() {
    return cy.contains('Cancel');
  }

  get btnSave() {
    return cy.contains('Save');
  }

  get closeIcon() {
    return cy.get('.ant-modal-close-x');
  }

  get btnOKConfirmPopUp() {
    return cy.get('.ant-modal-confirm-body-wrapper').contains('OK');
  }

  get alertMessage() {
    return cy.get('.ant-alert');
  }

  clickBtnNewLabel() {
    this.btnNewLabel.click();
  }

  clickBtnEdit() {
    this.btnEdit.click();
  }

  clickBtnArchive() {
    this.btnArchive.click();
  }

  typeNewLabelField(newLabel: string) {
    this.newLabelField.clear().type(newLabel);
  }

  clickBtnCancel() {
    this.btnCancel.click();
  }

  clickBtnSave() {
    this.btnSave.click();
  }

  closeNewLabelPopUp() {
    this.closeIcon.click();
  }

  clickBtnOKConfirmPopUp() {
    this.btnOKConfirmPopUp.click();
  }
}

export default new LabelsPage();
