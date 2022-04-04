import faker from 'faker';
describe('Should test the visit analyzers', () => {
  afterEach(() => {
    cy.clearLocalStorage();
  });

  beforeEach(() => {
    cy.login();
  });

  it('should test the visit analyzers form', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-header_actions_settings').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.visit_analyzer').click();
      cy.get('.mcs-VisitAnalyzersList_creation_button').click();
      cy.contains('default').click();
      const visitAnalyzerName = faker.random.words(2);
      cy.get('.mcs-PluginEditForm_name_field').type(visitAnalyzerName);
      cy.get('.mcs-VisitAnalyzerPage_error_recovery_strategy').click();
      cy.get('.mcs-select_itemOption--drop').click();
      cy.get('.mcs-form_saveButton_pluginForm').click();
      cy.contains(visitAnalyzerName).click();
      const newVisitAnalyzerName = faker.random.words(2);
      cy.get('.mcs-PluginEditForm_name_field').should('have.value', visitAnalyzerName);
      cy.get('.mcs-PluginEditForm_name_field').clear().type(newVisitAnalyzerName);
      cy.get('.mcs-VisitAnalyzerPage_error_recovery_strategy').click();
      cy.get('.mcs-select_itemOption--store-with-error-id-and-skip-upcoming-analyzers').click();
      cy.get('.mcs-form_saveButton_pluginForm').click();
      cy.contains(newVisitAnalyzerName).click();
      cy.get('.mcs-PluginEditForm_name_field').should('have.value', newVisitAnalyzerName);
      cy.get('.mcs-VisitAnalyzerPage_error_recovery_strategy').should(
        'contain',
        'Store With Error Id And Skip Upcoming Analyzers',
      );
    });
  });

  it('we cant save visit analyzer with missing fields', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-header_actions_settings').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.visit_analyzer').click();
      cy.get('.mcs-VisitAnalyzersList_creation_button').click();
      cy.contains('default').click();
      const visitAnalyzerName = faker.random.words(2);
      cy.get('.mcs-PluginEditForm_name_field').type(visitAnalyzerName);
      cy.get('.mcs-form_saveButton_pluginForm').click();
      cy.url().should('contain', 'create');
    });
  });

  it('should test the visit analyzer section on channels section', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-header_actions_settings').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.visit_analyzer').click();
      cy.get('.mcs-VisitAnalyzersList_creation_button').click();
      cy.contains('default').click();
      const firstVisitAnalyzerName = faker.random.word();
      cy.get('.mcs-PluginEditForm_name_field').type(firstVisitAnalyzerName);
      cy.get('.mcs-VisitAnalyzerPage_error_recovery_strategy').click();
      cy.get('.mcs-select_itemOption--drop').click();
      cy.get('.mcs-form_saveButton_pluginForm').click();
      cy.get('.mcs-VisitAnalyzersList_creation_button').click();
      cy.contains('default').click();
      const secondVisitAnalyzerName = faker.random.word();
      cy.get('.mcs-PluginEditForm_name_field').type(secondVisitAnalyzerName);
      cy.get('.mcs-VisitAnalyzerPage_error_recovery_strategy').click();
      cy.get('.mcs-select_itemOption--store-with-error-id').click();
      cy.get('.mcs-form_saveButton_pluginForm').click();
      cy.get('.mcs-VisitAnalyzersList_creation_button').click();
      cy.contains('default').click();
      const thirdVisitAnalyzerName = faker.random.word();
      cy.get('.mcs-PluginEditForm_name_field').type(thirdVisitAnalyzerName);
      cy.get('.mcs-VisitAnalyzerPage_error_recovery_strategy').click();
      cy.get('.mcs-select_itemOption--store-with-error-id-and-skip-upcoming-analyzers').click();
      cy.get('.mcs-form_saveButton_pluginForm').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.channels').click();
      cy.get('.mcs-channelsListPage_new_button').click();
      cy.get('.mcs-channelsListPage_new_site_button').click();
      cy.contains(data.datamartName).click();
      const siteName = faker.random.word();
      cy.get('.mcs-generalFormSection_site_name').type(siteName);
      const siteToken = faker.random.word();
      cy.get('.mcs-generalFormSection_site_token').type(siteToken);
      cy.get('.mcs-generalFormSection_site_domain').type(`${faker.lorem.word()}.com`);
      cy.get('.mcs-timelineStepBuilder_addStepBtn').click();
      cy.contains(firstVisitAnalyzerName).click();
      cy.get('.mcs-addButton').click();
      cy.get('.mcs-timelineStepBuilder_addStepBtn').click();
      cy.contains(secondVisitAnalyzerName).click();
      cy.get('.mcs-addButton').click();
      cy.get('.mcs-timelineStepBuilder_addStepBtn').click();
      cy.contains(thirdVisitAnalyzerName).click();
      cy.get('.mcs-addButton').click();
      cy.get('.mcs-form_saveButton_siteForm').click();
      cy.get('.mcs-channelsTable_search_bar').type(siteToken);
      cy.contains(siteName).click();
      cy.get('.mcs-VisitAnalyzerFormSection_timeline_errorRecoveryStrategy').scrollIntoView();
      cy.wait(5000);
      cy.get('.mcs-VisitAnalyzerFormSection_timeline_errorRecoveryStrategy')
        .eq(0)
        .should('contain', 'DROP');
      cy.get('.mcs-VisitAnalyzerFormSection_timeline_errorRecoveryStrategy')
        .eq(1)
        .should('contain', 'STORE_WITH_ERROR_ID');
      cy.get('.mcs-VisitAnalyzerFormSection_timeline_errorRecoveryStrategy')
        .eq(2)
        .should('contain', 'STORE_WITH_ERROR_ID_AND_SKIP_UPCOMING_ANALYZERS');
      cy.get('.mcs-timelineStepBuilder_sortBtn').eq(1).click();
      cy.get('.mcs-timelineStepBuilder_sortBtn').eq(3).click({ force: true });
      cy.get('.mcs-form_saveButton_siteForm').click();
      cy.get('.mcs-channelsTable_search_bar').type(siteToken);
      cy.contains(siteName).click();
      cy.wait(5000);
      cy.get('.mcs-VisitAnalyzerFormSection_timeline_errorRecoveryStrategy')
        .eq(0)
        .should('contain', 'STORE_WITH_ERROR_ID');
      cy.get('.mcs-VisitAnalyzerFormSection_timeline_errorRecoveryStrategy')
        .eq(1)
        .should('contain', 'STORE_WITH_ERROR_ID_AND_SKIP_UPCOMING_ANALYZERS');
      cy.get('.mcs-VisitAnalyzerFormSection_timeline_errorRecoveryStrategy')
        .eq(2)
        .should('contain', 'DROP');
    });
  });
});
