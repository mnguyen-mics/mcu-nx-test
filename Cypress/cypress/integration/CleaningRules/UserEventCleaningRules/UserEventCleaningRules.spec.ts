describe('User Event Cleaning Rules Test', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should test the cleaning rules update form', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-options').click({ force: true });
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.cleaningRules').click();
      // Add cleaning rule
      cy.get('.mcs-cleaningRules_creation_button').click({ force: true });
      cy.contains(`${data.datamartName}`).click();
      cy.get('.mcs-cleaningRules_seperator').should('contain', 'for');
      cy.get('.mcs-form_saveButton_cleaningRuleForm').click({ force: true });
      cy.get('.mcs-cleaningRules_table').should('contain', 'KEEP');
      cy.get('.mcs-cleaningRules_table').should('contain', 'DRAFT');
      cy.get('.mcs-cleaningRules_table').should('contain', '1 day');
      cy.get('.mcs-cleaningRules_table').should('contain', 'All');
      cy.get('.mcs-cleaningRules_table').should('contain', 'All');
      cy.get('.mcs-cleaningRules_table').should('contain', 'No filter');
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/channels`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          name: 'test',
          domain: 'test.com',
          enable_analytics: false,
          type: 'MOBILE_APPLICATION',
        },
      }).then(response => {
        const channelId: number = response.body.data.id;
        cy.contains('DRAFT').parent().parent().parent().find('.mcs-chevron').click();
        cy.get('.mcs-cleaningRulesActions_EDIT').click();
        // Update the cleaning rule
        cy.get('.mcs-cleaningRuleLifeTime_select').click();
        cy.wait(2000);
        cy.get('.mcs-cleaningRuleLifeTime_select_action_DELETE').click({
          force: true,
        });
        cy.get('.mcs-cleaningRules_seperator').should('contain', 'after');
        cy.get('.mcs-cleaningRuleLifeTime_input').type('999');
        cy.get('.mcs-scopeFormSection_activityTypeFilter_select').click();
        cy.get('.mcs-select_itemOption--app-visit').click();
        cy.get('.mcs-scopeFormSection_channelFilter_select').click();
        cy.contains(`${channelId}`).click();
        cy.get('.mcs-scopeFormSection_eventNameFilter_input').type('test_1');
        cy.get('.mcs-form_saveButton_cleaningRuleForm').click({ force: true });
        // Check that the cleaning rule got updated
        cy.get('.mcs-cleaningRules_table').should('contain', 'DELETE');
        cy.get('.mcs-cleaningRules_table').should('contain', '5 years, 5 months, 20 days');
        cy.get('.mcs-cleaningRules_table').should('contain', channelId);
        cy.get('.mcs-cleaningRules_table').should('contain', 'APP_VISIT');
        cy.get('.mcs-cleaningRules_table').should('contain', 'test_1');
        cy.contains('DRAFT').parent().parent().parent().find('.mcs-chevron').click();
        cy.get('.mcs-cleaningRulesActions_DELETE').click();
        cy.get('.mcs-cleaningRulesContainer_confirm_delete').click();
      });
    });
  });

  it('should test that only DRAFT cleaning rules can be deleted and updated', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-options').click({ force: true });
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.cleaningRules').click();
      cy.url().should('contain', 'datamart/cleaning_rules');
      // Add new cleaning rule
      cy.get('.mcs-cleaningRules_creation_button').click({ force: true });
      cy.contains(`${data.datamartName}`).click();
      cy.get('.mcs-scopeFormSection_eventNameFilter_input').type('test_2');
      cy.get('.mcs-form_saveButton_cleaningRuleForm').click({ force: true });
      cy.url().should('contain', 'datamart/cleaning_rules');
      cy.contains('LIVE').parent().parent().parent().find('.mcs-chevron').click();
      cy.get('.mcs-cleaningRulesActions_EDIT').click();
      cy.wait(500);
      cy.url().should('contain', 'datamart/cleaning_rules');
      cy.contains('test_2').parent().parent().find('.mcs-chevron').click({ force: true });
      cy.get('.mcs-cleaningRulesActions_EDIT').click({
        multiple: true,
        force: true,
      });
      cy.url().should('contain', 'edit');
      cy.get('.mcs-form_saveButton_cleaningRuleForm').click();
      cy.contains('DRAFT').parent().parent().parent().find('.mcs-chevron').click();
      cy.get('.mcs-cleaningRulesActions_DELETE').click();
      cy.get('.mcs-cleaningRulesContainer_confirm_delete').click();
    });
  });

  it('should check that we can only have 3 different life durations for user event cleaning rules with content filters', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-options').click({ force: true });
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.cleaningRules').click();
      cy.get('.mcs-cleaningRules_creation_button').click({ force: true });
      cy.contains(`${data.datamartName}`).click();
      cy.get('.mcs-cleaningRuleLifeTime_input').type('5');
      cy.get('.mcs-scopeFormSection_eventNameFilter_input').type('test_3');
      cy.get('.mcs-form_saveButton_cleaningRuleForm').click({ force: true });
      cy.url().should('contain', 'datamart/cleaning_rules');
      cy.get('.mcs-cleaningRulesContainer_update_status').contains('Activate the rule').click();
      cy.get('.mcs-cleaningRulesContainer_status_confirm_modal').click();
      cy.get('.mcs-cleaningRules_creation_button').click({ force: true });
      cy.contains(`${data.datamartName}`).click();
      cy.get('.mcs-cleaningRuleLifeTime_input').type('1');
      cy.get('.mcs-scopeFormSection_eventNameFilter_input').type('test_3');
      cy.get('.mcs-form_saveButton_cleaningRuleForm').click({ force: true });
      cy.url().should('contain', 'datamart/cleaning_rules');
      cy.get('.mcs-cleaningRulesContainer_update_status').contains('Activate the rule').click();
      cy.get('.mcs-cleaningRulesContainer_status_confirm_modal').click();
      cy.get('.mcs-cleaningRules_creation_button').click({ force: true });
      cy.contains(`${data.datamartName}`).click();
      cy.get('.mcs-cleaningRuleLifeTime_input').type('2');
      cy.get('.mcs-scopeFormSection_eventNameFilter_input').type('test_3');
      cy.get('.mcs-form_saveButton_cleaningRuleForm').click({ force: true });
      cy.url().should('contain', 'datamart/cleaning_rules');
      cy.get('.mcs-cleaningRulesContainer_update_status').contains('Activate the rule').click();
      cy.get('.mcs-cleaningRulesContainer_status_confirm_modal').click();
      cy.get('.mcs-cleaningRules_creation_button').click({ force: true });
      cy.contains(`${data.datamartName}`).click();
      cy.get('.mcs-cleaningRuleLifeTime_input').type('3');
      cy.get('.mcs-scopeFormSection_eventNameFilter_input').type('test_3');
      cy.get('.mcs-form_saveButton_cleaningRuleForm').click({ force: true });
      cy.url().should('contain', `datamart/cleaning_rules`);
      cy.get('.mcs-cleaningRulesContainer_update_status').contains('Activate the rule').click();
      cy.get('.mcs-cleaningRulesContainer_status_confirm_modal').click();
      cy.get('span').should(
        'contain',
        'Maximum 3 different life durations can be used for USER_EVENT_CLEANING_RULE with content filters',
      );
      // TODO add the case where we change the event name filter of the previously added cleaning rules
    });
  });

  // TODO add test that checks that we have to have at least one event cleaning rule with DELETE action
});
