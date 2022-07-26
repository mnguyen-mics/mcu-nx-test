import Page from '../Page';
import LeftMenu from '../LeftMenu';
import { logFunction, logGetter } from '../log/LoggingDecorator';

class SegmentsPage extends Page {
  constructor() {
    super();
  }

  @logFunction()
  goToPage() {
    LeftMenu.clickAudienceMenu();
    LeftMenu.clickAudienceSegments();
  }

  @logGetter()
  get segmentTypeSelector() {
    return cy.get('.mcs-segmentTypeSelector');
  }

  @logGetter()
  get btnSave() {
    return cy.get('.mcs-saveQueryAsActionBar_button');
  }

  @logFunction()
  clickBtnNewSegment() {
    cy.get('.mcs-segmentsActionBar_createNewSemgmentButton').click();
  }
}

export default SegmentsPage;
