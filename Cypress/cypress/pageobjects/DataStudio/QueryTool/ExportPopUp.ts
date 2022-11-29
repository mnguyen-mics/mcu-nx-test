import GenericPopUp from './GenericPopUp';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class ExportPopup extends GenericPopUp {
  constructor() {
    super();
  }

  @logFunction()
  clickOk() {
    super.clickOk();
    // it redirect to the exports page
    cy.wait(5000);
    cy.url({ timeout: 60000 }).should('contain', 'exports');
  }
}

export default ExportPopup;
