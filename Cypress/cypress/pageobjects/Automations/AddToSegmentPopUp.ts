import Page from '../Page';
import { logFunction, logGetter } from '../log/LoggingDecorator';

class AddToSegmentPopUp extends Page {
  constructor() {
    super();
  }

  @logGetter()
  get timeToLiveValue() {
    return cy.get('.mcs-ttlValue').find('#ttl\\.value');
  }

  @logGetter()
  get addToSegmentSectionForm() {
    return cy.get('.mcs-addToSegmentSectionForm');
  }

  @logFunction()
  typeAudienceSegmentName(audienceSegmentName: string) {
    cy.get('.mcs-audienceSegmentName').type(audienceSegmentName);
  }

  @logFunction()
  typeTimeToLiveValue(ttl: string) {
    cy.get('.mcs-ttlValue').click().type(ttl);
  }

  @logFunction()
  clickBtnUpdate() {
    cy.get('.mcs-form_saveButton_automationNodeForm').click();
  }
}

export default AddToSegmentPopUp;
