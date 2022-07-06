import Page from '../../Page';
import LeftMenu from '../../LeftMenu';
import HeaderMenu from '../../HeaderMenu';

class DatamartsPage extends Page {
  constructor() {
    super();
  }
  goToPage() {
    HeaderMenu.clickSettingsIcon();
    LeftMenu.clickDatamart();
    LeftMenu.clickMyDatamart();
  }

  clickStandardSegmentBuilder() {
    cy.get('.mcs-tabs_tab--segmentBuilder').click();
  }

  clickBtnNewStandardSegmentBuilder() {
    cy.get('.mcs-standardSegmentBuilder_creation_button').click();
  }

  typeStandardSegmentBuilderName(standardSegmentBuilderName: string) {
    cy.get('.mcs-standardSegmentBuilderName').type(standardSegmentBuilderName);
  }

  clickBtnSave() {
    cy.get('.mcs-form_saveButton_standardSegmentBuilderForm').click();
  }
}

export default DatamartsPage;
