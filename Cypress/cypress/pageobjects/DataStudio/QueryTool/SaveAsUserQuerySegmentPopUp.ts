import Page from '../../Page';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class SaveAsUserQuerySegmentPopUp extends Page {
  constructor() {
    super();
  }

  @logGetter()
  get btnAdvanced() {
    return cy.get('.cs-button optional-section-title');
  }

  @logGetter()
  get btnCancel() {
    return cy.get('.ant-btn').contains('Cancel');
  }

  @logGetter()
  get btnClose() {
    return cy.get('.ant-modal-close');
  }

  @logGetter()
  get btnOk() {
    return cy.get('.mcs-saveAsUserQuerySegmentModal_ok_button');
  }

  @logGetter()
  get inputName() {
    return this.popUp.find('.mcs-newUserQuerySegmentSimpleForm_name_input');
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
  clickCloseButton() {
    this.btnClose.click();
  }

  @logFunction()
  clickOk() {
    this.btnOk.click();
  }

  @logFunction()
  typeName(name: string) {
    this.inputName.type(name);
  }
}

export default SaveAsUserQuerySegmentPopUp;
