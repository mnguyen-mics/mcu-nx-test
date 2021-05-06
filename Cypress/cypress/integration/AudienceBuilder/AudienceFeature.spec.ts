describe('This test should check that the audience feature forms are working properly', () => {
  beforeEach(() => {
    cy.login();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
    });
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should test the audience feature forms', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-navigator-header-actions-settings').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
      cy.contains(data.datamartName).click();
      cy.contains('Audience Builder').click();
      cy.get('.mcs-audienceFeature_creation_button').click();
      cy.get('#name').type('Test Audience Feature Form');
      cy.get('#description').type('Test Audience Feature Form');
      cy.get('.mcs-audienceFeature_edit_query_button').click();
      cy.wait(5000);
      cy.get('.mcs-audienceFeature_edit_form_query_builder > textarea').type(
        '{selectall}{backspace}{backspace}',
        {
          force: true,
        },
      );
      cy.wait(1000);
      cy.get('.mcs-audienceFeature_edit_form_query_builder > textarea').type(
        'select {id} from UserPoint where creation_date = $test',
        {
          force: true,
          parseSpecialCharSequences: false,
        },
      );
      cy.get('.mcs-audienceFeature_update_query').click();
      cy.get('.mcs-form_saveButton_audienceFeatureForm').click();
      cy.contains('Audience Builder').click();
      cy.get('.mcs-audienceFeature_table')
        .should('contain', 'creation_date = $test')
        .and('contain', 'Test Audience Feature Form');
      cy.get('.mcs-audienceFeature_table').within($table => {
        cy.get('.mcs-tableActions_dropdown').first().click();
      });
      cy.get('.mcs-tableActions_settings\\.datamart\\.audienceFeatures\\.edit').first().click();
      cy.get('#name').type('Test Audience Feature Form - Edit');
      cy.get('#description').type('Test Audience Feature Form - Edit');
      cy.get('.mcs-audienceFeature_edit_query_button').click();
      cy.wait(5000);
      cy.get('.mcs-audienceFeature_edit_form_query_builder > textarea').type(
        '{selectall}{backspace}{backspace}',
        {
          force: true,
        },
      );
      cy.wait(1000);
      cy.get('.mcs-audienceFeature_edit_form_query_builder > textarea').type(
        'select {id} from UserPoint where creation_date > $test and creation_date < $test2',
        {
          force: true,
          parseSpecialCharSequences: false,
        },
      );
      cy.get('.mcs-audienceFeature_update_query').click();
      cy.get('.mcs-form_saveButton_audienceFeatureForm').click();
      cy.contains('Audience Builder').click();
      cy.get('.mcs-audienceFeature_table')
        .should('contain', 'creation_date > $test and creation_date < $test2')
        .and('contain', 'Test Audience Feature Form - Edit');
      cy.get('.mcs-audienceFeature_table').within($table => {
        cy.get('.mcs-tableActions_dropdown').first().click();
      });
      cy.get('.mcs-tableActions_settings\\.datamart\\.audienceFeatures\\.delete').first().click();
    });
  });

  it('audience feature shouldnt be created if the query is invalid', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-navigator-header-actions-settings').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
      cy.contains(data.datamartName).click();
      cy.contains('Audience Builder').click();
      cy.get('.mcs-audienceFeature_creation_button').click();
      cy.get('#name').type('Test Audience Feature Form');
      cy.get('#description').type('Test Audience Feature Form');
      cy.get('.mcs-audienceFeature_edit_query_button').click();
      cy.wait(5000);
      cy.get('.mcs-audienceFeature_edit_form_query_builder > textarea').type(
        '{selectall}{backspace}{backspace}',
        {
          force: true,
        },
      );
      cy.wait(1000);
      cy.get('.mcs-audienceFeature_edit_form_query_builder > textarea').type(
        'select {id} from UserPoint',
        {
          force: true,
          parseSpecialCharSequences: false,
        },
      );
      cy.get('.mcs-audienceFeature_update_query').click();
      cy.get('.mcs-form_saveButton_audienceFeatureForm').click();
      cy.wait(2000);
      cy.url().should('contain', '/create');
    });
  });
});
