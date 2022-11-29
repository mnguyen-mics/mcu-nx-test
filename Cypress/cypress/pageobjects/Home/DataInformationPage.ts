import Page from '../Page';
import { logFunction, logGetter } from '../log/LoggingDecorator';

class DataInformationPage extends Page {
  constructor() {
    super();
  }

  @logGetter()
  get dataInfoSectionTitle() {
    return cy.get('.mcs-chartMetaDataInfo_section_title');
  }

  @logGetter()
  get dataInfoQuery() {
    return cy.get('.mcs-chartMetaDataInfo_query_item');
  }

  @logGetter()
  get dataInfoTitle() {
    return cy.get('.mcs-chartMetaDataInfo_title');
  }

  @logFunction()
  clickExportToCSV() {
    cy.get('.mcs-chartMetaDataInfo_section_button').eq(1).click();
  }

  @logFunction()
  clickBtnClose() {
    cy.get('.mcs-close').click();
  }
}

export default DataInformationPage;
