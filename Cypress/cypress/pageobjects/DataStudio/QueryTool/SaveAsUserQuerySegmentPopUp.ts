import GenericPopUp from './GenericPopUp';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class SaveAsUserQuerySegmentPopUp extends GenericPopUp {
  constructor() {
    super();
  }

  @logGetter()
  get btnAdvanced() {
    return cy.get('.cs-button optional-section-title');
  }

  @logGetter()
  get inputName() {
    return this.popUp.find('.mcs-newUserQuerySegmentSimpleForm_name_input');
  }

  @logFunction()
  clickOk() {
    super.clickOk();
    // it redirect to the segment page
    cy.wait(5000);
    cy.url({ timeout: 60000 }).should('contain', 'segment');
  }

  @logFunction()
  typeName(name: string) {
    this.inputName.type(name);
  }
}

export default SaveAsUserQuerySegmentPopUp;
