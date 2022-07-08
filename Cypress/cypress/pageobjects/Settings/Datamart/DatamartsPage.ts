import Page from '../../Page';
import LeftMenu from '../../LeftMenu';
import HeaderMenu from '../../HeaderMenu';
import { logFunction } from '../../log/LoggingDecorator';

class DatamartsPage extends Page {
  constructor() {
    super();
  }

  @logFunction()
  goToPage() {
    HeaderMenu.clickSettingsIcon();
    LeftMenu.clickDatamart();
    LeftMenu.clickMyDatamart();
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
