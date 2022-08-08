import Page from '../../Page';
import SettingsMenu from '../SettingsMenu';
import DatamartMenu from './DatamartMenu';
import HeaderMenu from '../../HeaderMenu';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class DatamartsPage extends Page {
  constructor() {
    super();
  }

  @logFunction()
  goToPage() {
    HeaderMenu.clickSettingsIcon();
    SettingsMenu.clickDatamart();
    DatamartMenu.clickMyDatamart();
  }

  @logGetter()
  get datamartsSelctor() {
    return cy.get('.mcs-selector_container');
  }

  @logGetter()
  get datamartsContent() {
    return cy.get('.mcs-content-container');
  }

  @logGetter()
  get datamartReplicationContainer() {
    return cy.get('.mcs-datamartReplicationEditForm_formContainer');
  }

  @logFunction()
  clickStandardSegmentBuilder() {
    cy.get('.mcs-tabs_tab--segmentBuilder').click();
  }

  @logFunction()
  clickBtnNewStandardSegmentBuilder() {
    cy.get('.mcs-standardSegmentBuilder_creation_button').click();
  }

  @logFunction()
  typeStandardSegmentBuilderName(standardSegmentBuilderName: string) {
    cy.get('.mcs-standardSegmentBuilderName').type(standardSegmentBuilderName);
  }

  @logFunction()
  clickBtnSave() {
    cy.get('.mcs-form_saveButton_standardSegmentBuilderForm').click();
  }
}

export default DatamartsPage;
