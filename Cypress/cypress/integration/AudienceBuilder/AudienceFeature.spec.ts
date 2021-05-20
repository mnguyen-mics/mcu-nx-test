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
      cy.contains('Audience Features').click();
      cy.get('.mcs-audienceFeature_creation_button').click();
      cy.get('.mcs-audienceFeatureName').type('Test Audience Feature Form');
      cy.get('.mcs-audienceFeatureDescription').type('Test Audience Feature Form');
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
      cy.contains('Audience Features').click();
      cy.get('.mcs-audienceFeature_table')
        .should('contain', 'creation_date = $test')
        .and('contain', 'Test Audience Feature Form');
      cy.get('.mcs-audienceFeature_table').within($table => {
        cy.get('.mcs-chevron').first().click();
      });
      cy.get('.mcs-dropdown-actions').contains('Edit').click();
      cy.get('.mcs-audienceFeatureName').type(
        '{selectall}{backspace}Test Audience Feature Form - Edit',
      );
      cy.get('.mcs-audienceFeatureDescription').type(
        '{selectall}{backspace}Test Audience Feature Form - Edit',
      );
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
      cy.contains('Audience Features').click();
      cy.get('.mcs-audienceFeature_table')
        .should('contain', 'creation_date > $test and creation_date < $test2')
        .and('contain', 'Test Audience Feature Form - Edit');
      cy.get('.mcs-audienceFeature_table').within($table => {
        cy.get('.mcs-chevron').first().click();
      });
      cy.get('.mcs-dropdown-actions').contains('Delete').click();
      cy.get('.mcs-audienceFeatureDeletePopUp').contains('Delete').click();
      cy.get('.mcs-audienceFeature_table').should(
        'not.contain',
        'Test Audience Feature Form - Edit',
      );
    });
  });

  it('audience feature shouldnt be created if the query is invalid', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-navigator-header-actions-settings').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
      cy.contains(data.datamartName).click();
      cy.contains('Audience Features').click();
      cy.get('.mcs-audienceFeature_creation_button').click();
      cy.get('.mcs-audienceFeatureName').type('Test Audience Feature Form');
      cy.get('.mcs-audienceFeatureDescription').type('Test Audience Feature Form');
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
      cy.get('.mcs-audienceFeature_update_query').click({ force: true });
      cy.get('.mcs-form_saveButton_audienceFeatureForm').click({ force: true });
      cy.wait(2000);
      cy.url().should('contain', '/create');
    });
  });
});
