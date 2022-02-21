import faker from 'faker';
describe('The purpose of this test is to check the creation of a segment with the advanced segment builder tool', () => {
  beforeEach(() => {
    cy.login();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
    });
  });
  afterEach(() => {
    cy.clearLocalStorage();
  });
  it('Should test the date attribute', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      //Go to Advanced Segment Builder
      cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.builder').click();
      cy.get('.mcs-advancedSegmentBuilder').click();
      //Add an Object Node
      cy.get('.mcs-plusNodeWidget_button').click();
      cy.get('.mcs-plusNodeWidget_menu_object').click();
      cy.get('.mcs-objectNodeSection_select').click();
      cy.get('.mcs-select_itemOption--activity-events').click();
      //Add Field Condition
      cy.get('.mcs-fieldNodeSection_add_field_button').click();
      cy.get('.mcs-fieldNodeForm_select').click();
      cy.get('.mcs-select_itemOption--date').click();
      cy.get('.mcs-relativeAbsoluteForm_relative').click();
      cy.get('.mcs-relativeAbsoluteForm_dateValue').click().type('{selectall}{backspace}3');
      cy.get('.mcs-relativeAbsoluteForm_period_select').click();
      cy.get('.mcs-relativeAbsoluteForm_month_select').click();
      cy.get('.mcs-form_saveButton_queryDocumentForm').click();
      //Check the relative date value
      cy.get('.mcs-fieldNodeWidget').click();
      cy.get('.mcs-fieldNodeWidget_menu_edit').click();
      cy.get('.mcs-relativeAbsoluteForm_dateValue')
        .find('input')
        .should('have.attr', 'value')
        .and('equal', '3');
      cy.get('.mcs-relativeAbsoluteForm_period_select').should('contain', 'Month');
    });
  });
  it('Should test the creation of a segment with a frequency parameter', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      //Go to Advanced Segment Builder
      cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.builder').click();
      cy.get('.mcs-advancedSegmentBuilder').click();
      //Add an Object Node with frequency option
      cy.get('.mcs-plusNodeWidget_button').click();
      cy.get('.mcs-plusNodeWidget_menu_object').click();
      cy.get('.mcs-objectNodeSection_select').click();
      cy.get('.mcs-select_itemOption--accounts').click();
      cy.get('.mcs-objectNodeSection_checkbox').click();
      const frequency_value = faker.random.number().toString();
      cy.get('.mcs-objectNodeSection_frequency_value').click().type(frequency_value);
      cy.get('.mcs-form_saveButton_queryDocumentForm').click();
      //Convert to Otql
      cy.get('.mcs-saveQueryAsActionBar_convert2Otql').click();
      cy.get('.mcs-convert2Otql')
        .should('contain.html', 'code')
        .and('contain.text', '@ScoreSum(min: ' + frequency_value);
    });
  });

  it('Should test the open from existing segment on advanced segment builder', () => {
    cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
    cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.builder').click();
    cy.get('.mcs-advancedSegmentBuilder').click();
    cy.get('.mcs-plusNodeWidget_button').click();
    cy.get('.mcs-plusNodeWidget_menu_object').click();
    cy.get('.mcs-objectNodeSection_select').click();
    cy.get('.mcs-select_itemOption--accounts').click();
    cy.get('.mcs-objectNodeSection_checkbox').click();
    const frequencyValue = faker.random.number().toString();
    cy.get('.mcs-objectNodeSection_frequency_value').click().type(frequencyValue);
    cy.get('.mcs-form_saveButton_queryDocumentForm').click();
    cy.get('.mcs-saveQueryAsActionBar_button').click();
    cy.get('.mcs-saveQueryAsActionBar_menu_userQuery').click();
    const segmentName = faker.random.number().toString();
    cy.get('.mcs-newUserQuerySegmentSimpleForm_name_input').type(segmentName);
    cy.get('.mcs-saveAsUserQuerySegmentModal_ok_button').click();
    cy.url().should('match', /.*segments\/[0-9]+/);
    cy.url().then(url => {
      const segmentId: number = parseInt(
        url.substring(url.indexOf('segments') + 9, url.length),
        10,
      );
      cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.builder').click();
      cy.get('.mcs-advancedSegmentBuilder').click();
      cy.get('.mcs-segmentSelector_button').click();
      cy.get('.mcs-chartMetaDataInfo_container').should('contain', segmentName);
      cy.get('.mcs-segmentSelector_segmentNameInput').find('input').clear().type(segmentName);
      cy.wait(5000);
      cy.get('.mcs-chartMetaDataInfo_container').should('contain', segmentName);
      cy.get('.mcs-segmentSelector_segmentNameInput').find('input').clear().type(`${segmentId}`);
      cy.wait(5000);
      cy.get('.mcs-chartMetaDataInfo_container').should('contain', segmentName);
      cy.contains(segmentName).click();
      cy.get('.query-builder').should('contain', frequencyValue);
    });
  });
});
