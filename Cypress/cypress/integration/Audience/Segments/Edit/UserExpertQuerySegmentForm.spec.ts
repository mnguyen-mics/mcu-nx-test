import SegmentsPage from '../../../../pageobjects/Audience/SegmentsPage';
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
    const segmentsPage = new SegmentsPage();
    segmentsPage.goToPage();
    segmentsPage.clickBtnNewSegment();
    segmentsPage.clickUserExpertQuery();

    cy.fillExpertQuerySegmentForm(segmentName, 'SELECT {id} FROM UserPoint');

    segmentsPage.clickBtnSaveNewSegment();
    cy.url({ timeout: 10000 }).should('match', /.*audience\/segments\/\d*\?/);
    segmentsPage.goToPage();
    segmentsPage.segmentNameInTable.should('have.length.gte', 1);
    segmentsPage.clickUserQueryFilter();
    segmentsPage.pickCreatedSegment(segmentName);
    segmentsPage.segmentNameInTable.should('have.length', 1).click();
    segmentsPage.clickBtnEdit();
    cy.fillExpertQuerySegmentForm(segmentName, ' WHERE creation_date <= "now-120d/d');
    segmentsPage.clickBtnSaveNewSegment();
    cy.url({ timeout: 5000 }).should('match', /.*audience\/segments\/\d*\?/);
  });
});
