import Page from '../Page';

class DataInformationPage extends Page {
  constructor() {
    super();
  }

  get dataInfoSectionTitle() {
    return cy.get('.mcs-chartMetaDataInfo_section_title');
  }

  get dataInfoQuery() {
    return cy.get('.mcs-chartMetaDataInfo_query_item');
  }

  get dataInfoTitle() {
    return cy.get('.mcs-chartMetaDataInfo_title');
  }

  clickExportToCSV() {
    cy.get('.mcs-chartMetaDataInfo_section_button').eq(1).click();
  }

  clickBtnClose() {
    cy.get('.mcs-close').click();
  }
}

export default DataInformationPage;
