import faker from 'faker';

describe('User Expert Query Segment Form Test', () => {
  beforeEach(() => {
    cy.login();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
    });
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('should create User Expert Query Segment', () => {
    const segmentName = `${Date.now()}-${faker.random.words(2)}`;
    cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
    cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.segments').click();
    cy.get('.mcs-actionbar').find('.mcs-primary').click();
    cy.get('.mcs-segmentTypeSelector_UserExpertQuery').click();

    cy.fillExpertQuerySegmentForm(segmentName, 'SELECT {id} FROM UserPoint');

    cy.get('.mcs-form_saveButton_audienceSegmentForm').click();
    cy.url({ timeout: 10000 }).should('match', /.*audience\/segments\/\d*\?/);
    cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.segments').click();
    cy.get('.mcs-campaigns-link').should('have.length.gte', 1);
    cy.get('.mcs-audienceSegmentTable-typeFilter').click();
    cy.get('.mcs-audienceSegmentTable-typeFilter_userQuery').click();
    cy.get('.mcs-search-input').type(segmentName + '{enter}');
    // pick the created segment
    cy.get('.mcs-campaigns-link').should('have.length', 1).click();
    cy.get('.mcs-actionbar').find('.mcs-pen').click();
    cy.fillExpertQuerySegmentForm(segmentName, ' WHERE creation_date <= "now-120d/d');
    cy.get('.mcs-form_saveButton_audienceSegmentForm').click();
    cy.url({ timeout: 5000 }).should('match', /.*audience\/segments\/\d*\?/);
  });
});
