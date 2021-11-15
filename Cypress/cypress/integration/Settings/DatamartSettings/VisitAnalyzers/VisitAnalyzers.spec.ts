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
      cy.get('.mcs-navigator-header-actions-settings').click();
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
      cy.get('.mcs-navigator-header-actions-settings').click();
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
});
