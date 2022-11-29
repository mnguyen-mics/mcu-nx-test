import Page from '../../Page';
import SettingsMenu from '../SettingsMenu';
import DatamartMenu from '../Datamart/DatamartMenu';
import HeaderMenu from '../../HeaderMenu';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class PartitionsPage extends Page {
  constructor() {
    super();
  }

  @logFunction()
  goToPage() {
    HeaderMenu.clickSettingsIcon();
    SettingsMenu.clickDatamart();
    DatamartMenu.clickPartitions();
  }

  @logGetter()
  get btnSave() {
    return cy.get('.mcs-form_saveButton_partitionForm');
  }

  @logFunction()
  clickBtnNewAudiencePartitions() {
    cy.get('.mcs-audiencePartitionsActionBar_newAudiencePartitionsButton').click();
  }

  @logFunction()
  clickBtnRandomSplit() {
    cy.get('.mcs-audiencePartitionsActionBar_newRandomSplitButton').click();
  }
}

export default PartitionsPage;
