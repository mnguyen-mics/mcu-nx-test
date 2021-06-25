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
});
