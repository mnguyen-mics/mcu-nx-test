import faker from 'faker';

describe('This test should check that the audience feature forms are working properly', () => {
  beforeEach(() => {
    cy.login();
    cy.readFile('cypress/fixtures/init_infos.json').then((data) => {
      cy.switchOrg(data.organisationName);
    });
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  const createAudienceBuilder = (
    datamartName: string,
    audienceBuilderName: string,
  ) => {
    cy.get('.mcs-header-actions-settings').click();
    cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
    cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
    cy.contains(datamartName).click();
    cy.contains('Audience Builder').click();
    cy.get('.mcs-audienceBuilder_creation_button').click();
    cy.get('#audienceBuilder\\.name').type(audienceBuilderName);
    cy.get('.mcs-form_saveButton_audienceBuilderForm').click();
  };

  it('Should test the audience builder', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then((data) => {
      const audienceBuilderName = faker.random.words(2);
      const audienceFeatureName = faker.random.words(2);
      createAudienceBuilder(data.datamartName, audienceBuilderName);
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${
          data.datamartId
        }/audience_features`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          name: audienceFeatureName,
          description: 'Test - Audience Builder - Cypress',
          object_tree_expression: 'creation_ts > $date1',
          addressable_object: 'UserPoint',
        },
      }).then(() => {
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/datamarts/${
            data.datamartId
          }/channels`,
          method: 'POST',
          headers: { Authorization: data.accessToken },
          body: {
            name: 'test',
            domain: 'test.com',
            enable_analytics: false,
            type: 'MOBILE_APPLICATION',
          },
        }).then((responseChannel) => {
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/datamarts/${
              data.datamartId
            }/user_activities?processing_pipeline=false`,
            method: 'POST',
            headers: { Authorization: data.accessToken },
            body: {
              $user_account_id: 'test_percentage_3',
              $type: 'APP_VISIT',
              $site_id: `${responseChannel.body.data.id}`,
              $session_status: 'NO_SESSION',
              $ts: new Date().getTime(),
              $events: [],
            },
          }).then(() => {
            cy.wait(20000);
            cy.goToHome(data.organisationId);
            cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
            cy.get(
              '.mcs-sideBar-subMenuItem_menu\\.audience\\.segmentBuilderV2',
            ).click();
            cy.wait(3000);
            cy.url().then((url) => {
              if (url.match(/.*segment-builder-v2$/g))
                cy.contains(audienceBuilderName).click();
            });
            cy.get('.mcs-audienceBuilder_totalAudience').should('not.contain', '0');
            cy.get('.mcs-audienceBuilder_moreButton').first().click();
            cy.contains(audienceFeatureName).click();
            cy.get('.add-button').click();
            cy.get('.mcs-audienceBuilder_dashboard_refresh_button').click();
            cy.get('.mcs-audienceBuilder_totalAudience').should('not.contain', '0');
            cy.get('.mcs-audienceBuilder_excludeButton').click();
            cy.get('.mcs-audienceBuilder_moreButton').eq(1).click();
            cy.contains(audienceFeatureName).click();
            cy.get('.add-button').click();
            cy.get('.mcs-audienceBuilder_dashboard_refresh_button').click();
            cy.get('.mcs-audienceBuilder_totalAudience').should('contain', '0');
          });
        });
      });
    });
  });

  it('should test the audience builder using match clause', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then((data) => {
      const audienceBuilderName = faker.random.words(2);
      const audienceFeatureName = faker.random.words(2);
      createAudienceBuilder(data.datamartName, audienceBuilderName);
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${
          data.datamartId
        }/audience_features`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          name: audienceFeatureName,
          description: 'Test - Audience Builder - Cypress',
          object_tree_expression: 'accounts{match (user_account_id,$id)}',
          addressable_object: 'UserPoint',
        },
      }).then(() => {
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/datamarts/${
            data.datamartId
          }/channels`,
          method: 'POST',
          headers: { Authorization: data.accessToken },
          body: {
            name: 'test',
            domain: 'test.com',
            enable_analytics: false,
            type: 'MOBILE_APPLICATION',
          },
        }).then((responseChannel) => {
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/datamarts/${
              data.datamartId
            }/user_activities?processing_pipeline=false`,
            method: 'POST',
            headers: { Authorization: data.accessToken },
            body: {
              $user_account_id: 'test_match_audience_builder',
              $type: 'APP_VISIT',
              $site_id: `${responseChannel.body.data.id}`,
              $session_status: 'NO_SESSION',
              $ts: new Date().getTime(),
              $events: [],
            },
          }).then(() => {
            cy.wait(20000);
            cy.goToHome(data.organisationId);
            cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
            cy.get(
              '.mcs-sideBar-subMenuItem_menu\\.audience\\.segmentBuilderV2',
            ).click();
            cy.wait(3000);
            cy.url().then((url) => {
              if (url.match(/.*segment-builder-v2$/g))
                cy.contains(audienceBuilderName).click();
            });
            cy.get('.mcs-audienceBuilder_totalAudience').should(
              'not.contain',
              '0',
            );
            cy.get('.mcs-audienceBuilder_moreButton').first().click();
            cy.contains(audienceFeatureName).click();
            cy.get('.add-button').click();
            cy.get('.mcs-audienceBuilder_audienceFeature')
              .first()
              .within(() => {
                cy.get('input').type('test_match_audience_builder');
              });
            cy.get('.mcs-audienceBuilder_dashboard_refresh_button').click();
            cy.get('.mcs-audienceBuilder_totalAudience').should(
              'not.contain',
              '0',
            );
          });
        });
      });
    });
  });
});
