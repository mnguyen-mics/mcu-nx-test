describe('Profile Cleaning Rules Tests', () => {
  before(() => {
    cy.login();
  });
  beforeEach(() => {
    cy.restoreLocalStorageCache();
  });

  afterEach(() => {
    cy.saveLocalStorageCache();
  });
  it('should test the profile cleaning rules forms', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-options').click({ force: true });
      cy.get(
        `[href="#/v2/o/${data.organisationId}/settings/datamart/audience/partitions"]`,
      ).click();
      cy.get(`[href="#/v2/o/${data.organisationId}/settings/datamart/cleaning_rules"]`).click();
      cy.get('.ant-tabs-nav-wrap').find('.ant-tabs-tab').eq(1).click();
      cy.contains('New Cleaning Rule').click({ force: true });
      // Organisation may contain multiple datamarts so this is essential
      cy.contains(`${data.datamartName}`).click();
      cy.get('.ant-select.ant-select-disabled')
        .find('.ant-select-selection-selected-value')
        .should('contain', 'DELETE');
      cy.get('.text-center').should('contain', 'after');
      cy.get('.ant-row-flex.ant-row-flex-space-between.ant-row-flex-middle.mcs-actionbar-edit')
        .find('button')
        .click({ force: true });
      cy.get('.ant-table-tbody').find('tr').eq(0).should('contain', 'DELETE');
      cy.get('.ant-table-tbody').find('tr').eq(0).should('contain', 'DRAFT');
      cy.get('.ant-table-tbody').find('tr').eq(0).should('contain', '1 day');
      cy.get('.ant-table-tbody').find('tr').eq(0).should('contain', 'All');
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/compartments`,
        method: 'GET',
        headers: { Authorization: data.accessToken },
      }).then(response => {
        const compartmentId: number = response.body.data[0].compartment_id;
        cy.get('.ant-table-tbody').find('tr').eq(0).find('.mcs-chevron').click();
        cy.contains('View').click();
        // Update the cleaning rule
        cy.get('.ant-select.ant-select-disabled')
          .find('.ant-select-selection-selected-value')
          .should('contain', 'DELETE');
        cy.get('.text-center').should('contain', 'after');
        cy.get('.ant-input-number-input').type('999');
        cy.contains('No filter').click();
        cy.contains(`${compartmentId}`).click();
        cy.get('button').contains('Save User Profile Cleaning Rule').click({ force: true });
        cy.get('.ant-table-tbody').find('tr').eq(0).should('contain', 'DELETE');
        cy.get('.ant-table-tbody').find('tr').eq(0).should('contain', '5 years, 5 months, 20 days');
        cy.get('.ant-table-tbody').find('tr').eq(0).should('contain', compartmentId);
        cy.get('.ant-table-tbody').find('tr').eq(0).should('contain', 'DRAFT');
        // Delete the compartment filter
        cy.get('.ant-table-tbody').find('tr').eq(0).find('.mcs-chevron').click();
        cy.contains('View').click();
        cy.get('.ant-select.ant-select-disabled')
          .find('.ant-select-selection-selected-value')
          .should('contain', 'DELETE');
        cy.get('.text-center').should('contain', 'after');
        cy.contains(`${compartmentId}`).click();
        cy.contains('No filter').click();
        cy.get('button').contains('Save User Profile Cleaning Rule').click({ force: true });
        cy.get('.ant-table-tbody').find('tr').eq(0).should('contain', 'DELETE');
        cy.get('.ant-table-tbody').find('tr').eq(0).should('contain', '5 years, 5 months, 20 days');
        cy.get('.ant-table-tbody').find('tr').eq(0).should('contain', 'All');
        // Delete the rule
        cy.get('.ant-table-tbody').find('tr').eq(0).find('.mcs-chevron').click();
        cy.contains('Delete').click();
        cy.contains('Delete now').click();
      });
    });
  });

  it('should check that only draft profile cleaning rules can be updated', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-options').click({ force: true });
      cy.get(
        `[href="#/v2/o/${data.organisationId}/settings/datamart/audience/partitions"]`,
      ).click();
      cy.get(`[href="#/v2/o/${data.organisationId}/settings/datamart/cleaning_rules"]`).click();
      cy.contains('Profile Based Cleaning Rules').click();
      cy.contains('New Cleaning Rule').click({ force: true });
      cy.contains(`${data.datamartName}`).click();
      cy.get('button').contains('Save User Profile Cleaning Rule').click({ force: true });
      cy.get('.ant-table-tbody').find('tr').eq(0).find('.mcs-chevron').click();
      cy.contains('View').parent().should('have.attr', 'aria-disabled', 'false');
      cy.contains('Delete').parent().should('have.attr', 'aria-disabled', 'false');
      cy.contains('Activate the rule').click();
      cy.contains('Confirm').click();
      cy.get('.ant-table-tbody').find('tr').eq(0).find('.mcs-chevron').click();
      cy.contains('View').parent().should('have.attr', 'aria-disabled', 'true');
      cy.contains('Delete').parent().should('have.attr', 'aria-disabled', 'true');
      cy.contains('Archive the rule').click();
      cy.contains('Confirm').click();
      cy.get('.ant-table-tbody').find('tr').eq(0).find('.mcs-chevron').click();
      cy.contains('View').parent().should('have.attr', 'aria-disabled', 'true');
      cy.contains('Delete').parent().should('have.attr', 'aria-disabled', 'true');
    });
  });

  // TODO add test for content filter behavior once it's defined with the PMS
});
