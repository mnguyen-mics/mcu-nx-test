import SegmentsPage from '../../../pageobjects/Audience/SegmentsPage';

describe('Audience Segments List Test', () => {
  beforeEach(() => {
    cy.login();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('check that filters on the audience segment page are persisted', () => {
    const segmentsPage = new SegmentsPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
      segmentsPage.goToPage();
      segmentsPage.pickCreatedSegment('test');
      segmentsPage.clickUserListFilter();
      cy.reload();
      segmentsPage.searchBar.find('input').should('have.value', 'test');
      segmentsPage.filterField.should('contain', 'User List');
      cy.switchOrg('dogfooding');
      segmentsPage.filterField.should('not.contain', 'User List');
      segmentsPage.clickUserQueryFilter();
      segmentsPage.searchBar.find('input').clear().type('test_1{enter}');
      cy.reload();
      segmentsPage.searchBar.find('input').should('have.value', 'test_1');
      segmentsPage.filterField.should('contain', 'User Query');
    });
  });

  it('test the persisted filter', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const segmentsPage = new SegmentsPage();
      cy.switchOrg(data.organisationName);
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/audience_segments?organisation_id=${
          data.organisationId
        }`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          datamart_id: data.datamartId,
          type: 'USER_LIST',
          name: 'Not Persisted Segment test',
          persisted: false,
          feed_type: 'FILE_IMPORT',
        },
      }).then(() => {
        segmentsPage.goToPage();
        segmentsPage.clickBtnIsPersisted();
        cy.contains('Not persisted').click();
        segmentsPage.segmentNameInTable.should('contain', 'Not Persisted Segment test');
        cy.contains('Persisted').click();
        segmentsPage.segmentNameInTable.should('not.contain', 'Not Persisted Segment test');
      });
    });
  });
});
