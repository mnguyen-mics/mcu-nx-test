describe('Audience Segments List Test', () => {
  beforeEach(() => {
    cy.login();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('check that filters on the audience segment page are persisted', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.segments').click();
      cy.get('.mcs-audienceSegmentsTable_search_bar').type('test{enter}');
      cy.get('.mcs-audienceSegmentTable-typeFilter').click();
      cy.get('.mcs-audienceSegmentTable-typeFilter_userList').click();
      cy.reload();
      cy.get('.mcs-audienceSegmentsTable_search_bar').find('input').should('have.value', 'test');
      cy.get('.mcs-audienceSegmentTable-typeFilter').should('contain', 'User List');
      cy.switchOrg('dogfooding');
      cy.get('.mcs-audienceSegmentTable-typeFilter').should('not.contain', 'User List');
      cy.get('.mcs-audienceSegmentTable-typeFilter').click();
      cy.get('.mcs-audienceSegmentTable-typeFilter_userQuery').click();
      cy.get('.mcs-audienceSegmentsTable_search_bar').find('input').clear().type('test_1{enter}');
      cy.reload();
      cy.get('.mcs-audienceSegmentsTable_search_bar').find('input').should('have.value', 'test_1');
      cy.get('.mcs-audienceSegmentTable-typeFilter').should('contain', 'User Query');
    });
  });

  it('test the persisted filter', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
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
        cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
        cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.segments').click();
        cy.get('.mcs-audienceSegmentsTable_is_persisted').click();
        cy.contains('Not persisted').click();
        cy.get('.mcs-audienceSegmentTable').should('contain', 'Not Persisted Segment test');
        cy.contains('Persisted').click();
        cy.get('.mcs-audienceSegmentTable').should('not.contain', 'Not Persisted Segment test');
      });
    });
  });
});
