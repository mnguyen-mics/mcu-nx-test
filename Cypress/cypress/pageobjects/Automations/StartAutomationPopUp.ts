import Page from '../Page';
import { logFunction, logGetter } from '../log/LoggingDecorator';

class StartAutomationPopUp extends Page {
  constructor() {
    super();
  }

  @logGetter()
  get searchField() {
    return cy.get('.mcs-formSearchInput');
  }

  @logGetter()
  get btnStandarsEventsCofiguration() {
    return cy
      .get('.mcs-reactToEventAutomation_buttonSwitchMode_reactToEventAdvanced')
      .children()
      .first()
      .children()
      .first();
  }

  @logFunction()
  clickSearchField() {
    this.searchField.click().type('{enter}');
  }

  @logFunction()
  clickBtnUpdate() {
    cy.get('.mcs-form_saveButton_automationNodeForm').click();
  }

  @logFunction()
  clickBtnAdvancedConfiguration() {
    cy.get('.mcs-reactToEventAutomation_buttonSwitchMode_reactToEventAdvanced').click();
  }

  @logFunction()
  clickBtnSaveEditStartAutomation() {
    cy.get('.mcs-form_saveButton_reactToEventForm').click();
  }

  @logFunction()
  typeEventName(eventName: string) {
    this.searchField.type(eventName);
  }
}

export default StartAutomationPopUp;
