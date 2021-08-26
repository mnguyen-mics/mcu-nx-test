import faker from 'faker';
describe('AudienceExperimentation Form Test', () => {
  before(() => {
    cy.login();
  });

  beforeEach(() => {
    cy.restoreLocalStorageCache();
  });

  afterEach(() => {
    cy.saveLocalStorageCache();
  });

  it('should create User Expert Query Segment and an audience experimentation segment', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const segmentName = `${Date.now()}-${faker.random.words(2)}`;
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.segments').click();
      cy.get('.mcs-actionbar').find('.mcs-primary').click();
      cy.get('.mcs-segmentTypeSelector_UserExpertQuery').click();
      cy.fillExpertQuerySegmentForm(segmentName, 'SELECT {id} FROM UserPoint');
      cy.get('.mcs-form_saveButton_audienceSegmentForm').click();
      cy.url().should('match', /.*audience\/segments\/\d*\?/);
      cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.segments').click();
      cy.get('.mcs-audienceSegmentsTable_search_bar').type(segmentName + '{enter}');
      cy.get('.mcs-campaigns-link').should('have.length', 1).click();
      cy.get('.mcs-dots').click();
      cy.get('.mcs-menu-antd-customized_item--experimentation').click();
      cy.get('.mcs-menu-list').first().click();
      cy.get('.mcs-formSlider').click();
      cy.get('.mcs-form_saveButton_experimentationForm').click();
      cy.url().should('contain', `${data.organisationId}/audience/segments/`);
    });
  });
});
