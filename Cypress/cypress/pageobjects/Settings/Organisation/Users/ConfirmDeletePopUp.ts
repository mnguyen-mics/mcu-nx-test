import Page from '../../../Page';
import { logFunction, logGetter } from '../../../log/LoggingDecorator';

class ConfirmDeletePopUp extends Page {
  constructor() {
    super();
  }

  @logGetter()
  get popUp() {
    return cy.get('.ant-modal-confirm-body-wrapper');
  }

  @logGetter()
  get btnOK() {
    return this.popUp.contains('OK');
  }

  @logGetter()
  get btnCancel() {
    return this.popUp.contains('Cancel');
  }

  @logFunction()
  clickBtnOK() {
    this.btnOK.click();
  }

  @logFunction()
  clickBtnCancel() {
    this.btnCancel.click();
  }
}

export default ConfirmDeletePopUp;
