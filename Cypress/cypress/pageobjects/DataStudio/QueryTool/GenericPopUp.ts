import Page from '../../Page';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class GenericPopUp extends Page {
  constructor() {
    super();
  }

  @logGetter()
  get btnCancel() {
    return this.popUp.find('.ant-btn').contains('Cancel');
  }

  @logGetter()
  get btnClose() {
    return this.popUp.find('.ant-modal-close');
  }

  @logGetter()
  get btnOk() {
    return this.popUp.find('.ant-btn').contains('OK');
  }

  @logGetter()
  get input() {
    return this.popUp.find('.ant-input');
  }

  @logGetter()
  get popUp() {
    return cy.get('.ant-modal-content');
  }

  @logFunction()
  clickCancel() {
    this.btnCancel.click();
  }

  @logFunction()
  clickClose() {
    this.btnClose.click();
  }

  @logFunction()
  clickOk() {
    this.btnOk.click();
  }

  @logFunction()
  typeInInput(data: string) {
    this.input.type(data);
  }
}

export default GenericPopUp;
