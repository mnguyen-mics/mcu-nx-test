import Page from '../../../Page';

class ConfirmDeletePopUp extends Page {
  constructor() {
    super();
  }

  get popUp() {
    return cy.get('.ant-modal-confirm-body-wrapper');
  }

  get btnOK() {
    return this.popUp.contains('OK');
  }

  get btnCancel() {
    return this.popUp.contains('Cancel');
  }

  clickBtnOK() {
    this.btnOK.click();
  }

  clickBtnCancel() {
    this.btnCancel.click();
  }
}

export default ConfirmDeletePopUp;
