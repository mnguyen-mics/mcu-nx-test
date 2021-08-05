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
      cy.get('.mcs-options').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.cleaningRules').click();
      cy.get('.mcs-tabs_tab').eq(1).click();
      cy.get('.mcs-cleaningRules_creation_button:visible').click();
      // Organisation may contain multiple datamarts so this is essential
      cy.contains(`${data.datamartName}`).click();
      cy.get('.mcs-cleaningRules_seperator').should('contain', 'after');
      cy.get('.mcs-form_saveButton_cleaningRuleForm').click();
      cy.get('.mcs-cleaningRules_table').should('contain', 'DELETE');
      cy.get('.mcs-cleaningRules_table').should('contain', 'DRAFT');
      cy.get('.mcs-cleaningRules_table').should('contain', '1 day');
      cy.get('.mcs-cleaningRules_table').should('contain', 'All');
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/compartments`,
        method: 'GET',
        headers: { Authorization: data.accessToken },
      }).then(response => {
        const compartmentId: number = response.body.data[0].compartment_id;
        cy.get('.mcs-cleaningRules_table').find('tr').eq(1).find('.mcs-chevron').click();
        cy.get('.mcs-cleaningRulesActions_EDIT').click();
        // Update the cleaning rule
        cy.get('.mcs-cleaningRules_seperator').should('contain', 'after');
        cy.get('.mcs-cleaningRuleLifeTime_input').type('999');
        cy.get('.mcs-scopeFormSection_compartment_select').click();
        cy.contains(`${compartmentId}`).click();
        cy.get('.mcs-form_saveButton_cleaningRuleForm').click({ force: true });
        cy.get('.mcs-cleaningRules_table').should('contain', 'DELETE');
        cy.get('.mcs-cleaningRules_table').should('contain', '5 years, 5 months, 20 days');
        cy.get('.mcs-cleaningRules_table').should('contain', compartmentId);
        cy.get('.mcs-cleaningRules_table').should('contain', 'DRAFT');
        // Delete the compartment filter
        cy.get('.mcs-cleaningRules_table').find('tr').eq(1).find('.mcs-chevron').click();
        cy.get('.mcs-cleaningRulesActions_EDIT').click();
        cy.get('.mcs-cleaningRules_seperator').should('contain', 'after');
        cy.contains(`${compartmentId}`).click();
        cy.contains('No filter').click();
        cy.get('.mcs-form_saveButton_cleaningRuleForm').click();
        cy.get('.mcs-cleaningRules_table').should('contain', 'DELETE');
        cy.get('.mcs-cleaningRules_table').should('contain', '5 years, 5 months, 20 days');
        cy.get('.mcs-cleaningRules_table').should('contain', 'All');
        // Delete the rule
        cy.get('.mcs-cleaningRules_table').find('tr').eq(1).find('.mcs-chevron').click();
        cy.get('.mcs-cleaningRulesActions_DELETE').click();
        cy.get('.mcs-cleaningRulesContainer_confirm_delete').click();
      });
    });
  });

  it('should check that only draft profile cleaning rules can be updated', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-options').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.cleaningRules').click();
      cy.get('.mcs-tabs_tab').eq(1).click();
      cy.get('.mcs-cleaningRules_creation_button:visible').click();
      cy.contains(`${data.datamartName}`).click();
      cy.get('.mcs-form_saveButton_cleaningRuleForm').click();
      cy.get('.mcs-cleaningRulesContainer_update_status').click();
      cy.get('.mcs-cleaningRulesContainer_status_confirm_modal').click();
      cy.get('.mcs-cleaningRules_table').find('tr').eq(1).find('.mcs-chevron').click();
      cy.get('.mcs-cleaningRulesActions_EDIT').click();
      cy.get('.mcs-cleaningRulesActions_DELETE').click();
      cy.get('.mcs-cleaningRulesContainer_update_status').click();
      cy.get('.mcs-cleaningRulesContainer_status_confirm_modal').click();
      cy.get('.mcs-cleaningRules_table').find('tr').eq(1).find('.mcs-chevron').click();
      cy.get('.mcs-cleaningRulesActions_EDIT').click();
      cy.get('.mcs-cleaningRulesActions_DELETE').click();
      cy.url().should('contain', 'datamart/cleaning_rules');
    });
  });

  // TODO add test for content filter behavior once it's defined with the PMS
});
