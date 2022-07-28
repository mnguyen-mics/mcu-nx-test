import Page from '../../../Page';
import { logFunction, logGetter } from '../../../log/LoggingDecorator';

class ConfirmArchivePopUp extends Page {
  constructor() {
    super();
  }

  @logGetter()
  get popUp() {
    return cy.get('.ant-modal-confirm-body-wrapper');
  }

  @logGetter()
  get btnConfirm() {
    return this.popUp.contains('Archive Now');
  }

  @logGetter()
  get btnCancel() {
    return this.popUp.contains('Cancel');
  }

  @logFunction()
  clickBtnConfirm() {
    this.btnConfirm.click();
  }

  @logFunction()
  clickBtnCancel() {
    this.btnCancel.click();
  }
}

export default ConfirmArchivePopUp;
