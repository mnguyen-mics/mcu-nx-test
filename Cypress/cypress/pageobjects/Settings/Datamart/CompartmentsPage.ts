import Page from '../../Page';
import SettingsMenu from '../SettingsMenu';
import DatamartMenu from '../Datamart/DatamartMenu';
import HeaderMenu from '../../HeaderMenu';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class CompartmentsPage extends Page {
  constructor() {
    super();
  }

  @logFunction()
  goToPage() {
    HeaderMenu.clickSettingsIcon();
    SettingsMenu.clickDatamart();
    DatamartMenu.clickCompartments();
  }

  @logGetter()
  get btnSave() {
    return cy.get('.mcs-form_saveButton_compartmentForm');
  }

  @logFunction()
  clickBtnNewCompartments() {
    cy.get('.mcs-compartmentsListPage_newCompartmentButton').click();
  }
}

export default CompartmentsPage;
