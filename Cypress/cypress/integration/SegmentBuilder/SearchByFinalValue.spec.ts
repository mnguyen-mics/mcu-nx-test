import faker from 'faker';

describe('This test should check that the search by final value feature is working properly', () => {
  //TODO delete the before method when search by final value is not feature flagged anymore
  before(() => {
    window.localStorage.setItem('features', '["audience-feature-search"]');
  });

  beforeEach(() => {
    cy.login();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
    });
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  const createStandardSegmentBuilder = (
    datamartName: string,
    standardSegmentBuilderName: string,
  ) => {
    cy.get('.mcs-navigator-header-actions-settings').click();
    cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
    cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
    cy.contains(datamartName).click();
    cy.get('.mcs-tabs_tab--segmentBuilder').click();
    cy.get('.mcs-standardSegmentBuilder_creation_button').click();
    cy.get('.mcs-standardSegmentBuilderName').type(standardSegmentBuilderName);
    cy.get('.mcs-form_saveButton_standardSegmentBuilderForm').click();
  };

  const createAudienceFeature = (
    datamartName: string,
    audienceFeatureName: string,
    audienceFeatureDescription: string,
    object_tree_expression: string,
  ) => {
    cy.get('.mcs-navigator-header-actions-settings').click();
    cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
    cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
    cy.contains(datamartName).click();
    cy.contains('Audience Features').click();
    cy.get('.mcs-audienceFeature_creation_button').click();
    cy.get('.mcs-audienceFeatureName').type(audienceFeatureName);
    cy.get('.mcs-audienceFeatureDescription').type(audienceFeatureDescription);
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
      'select {id} from UserPoint where ' + object_tree_expression,
      {
        force: true,
        parseSpecialCharSequences: false,
      },
    );
    cy.get('.mcs-audienceFeature_update_query').click();
    cy.get('.mcs-form_saveButton_audienceFeatureForm').click();
    cy.contains('Audience Features').click();
    cy.get('.mcs-audienceFeature_table')
      .should('contain', object_tree_expression)
      .and('contain', audienceFeatureName);
  };

  const importCSVFinalValues = (datamartId: string, accessToken: string) => {
    cy.request({
      url: `${Cypress.env('apiDomain')}/v1/datamarts/${datamartId}/reference_table_job_executions`,
      method: 'POST',
      headers: {
        Authorization: accessToken,
        'Content-Type': 'text/csv',
      },
      body:
        'level1,level2,level3,level4,final_value\n' +
        'emails,email,,,me@mediarithmics.com\n' +
        'profiles,country,,,maDagascar \n' +
        'profiles,country,,,france\n' +
        'activity_events,page,page_name,,Madona\n' +
        'activity_events,page,page_name,,france\n' +
        'activity_events,page,page_name,,salut MarkyMarc',
    });
  };

  it('Should trigger autocompletion after 3 characters and should not have doubloons of final values that have different path', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      //Import CSV file
      importCSVFinalValues(data.datamartId, data.accessToken);
      const standardSegmentBuilderName = faker.random.words(2);
      createStandardSegmentBuilder(data.datamartName, standardSegmentBuilderName);
      cy.get('.mcs-breadcrumb').should('be.visible');

      //Create audience feature 1
      let audienceFeatureName = 'Get audience by emails';
      let audienceFeatureDescription = 'Filter an audience with emails';
      let objectTreeExpression = 'emails {email == $email}';
      createAudienceFeature(
        data.datamartName,
        audienceFeatureName,
        audienceFeatureDescription,
        objectTreeExpression,
      );

      //Create audience feature 2
      audienceFeatureName = 'Get audience by countries';
      audienceFeatureDescription = 'Filter an audience with countries';
      objectTreeExpression = 'profiles {country == $country}';
      createAudienceFeature(
        data.datamartName,
        audienceFeatureName,
        audienceFeatureDescription,
        objectTreeExpression,
      );

      //Create audience feature 3
      audienceFeatureName = 'Get audience by page names';
      audienceFeatureDescription = 'Filter an audience with page names';
      objectTreeExpression = 'activity_events {page {page_name == $page_name} }';
      createAudienceFeature(
        data.datamartName,
        audienceFeatureName,
        audienceFeatureDescription,
        objectTreeExpression,
      );

      cy.goToHome(data.organisationId);
      cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.builder').click();
      cy.wait(3000);
      cy.url().then(url => {
        if (url.match(/.*segment-builder-selector$/g))
          cy.get('.mcs-standardSegmentBuilder_dropdownContainer').click();
      });
      cy.get('.mcs-timelineButton_left').click();
      cy.get('.mcs-standardSegmentBuilder_featureSelector--searchAudienceFeature').type('fr');
      cy.get('[title="france"]').should('not.exist');
      cy.get('.mcs-standardSegmentBuilder_featureSelector--searchAudienceFeature').type('a');
      cy.get('[title="france"]').should('exist').and('be.visible');
    });
  });
});
