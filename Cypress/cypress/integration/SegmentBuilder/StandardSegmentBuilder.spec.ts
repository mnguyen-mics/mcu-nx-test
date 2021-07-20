import faker from 'faker';

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

  const createStandardSegmentBuilder = (datamartName: string, standardSegmentBuilderName: string) => {
    cy.get('.mcs-navigator-header-actions-settings').click();
    cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
    cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
    cy.contains(datamartName).click();
    cy.contains('Segment Builders').click();
    cy.get('.mcs-standardSegmentBuilder_creation_button').click();
    cy.get('.mcs-standardSegmentBuilderName').type(standardSegmentBuilderName);
    cy.get('.mcs-form_saveButton_standardSegmentBuilderForm').click();
  };

  it('Should test the standard segment builder', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const standardSegmentBuilderName = faker.random.words(2);
      const audienceFeatureName = faker.random.words(2);
      createStandardSegmentBuilder(data.datamartName, standardSegmentBuilderName);
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/audience_features`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          name: audienceFeatureName,
          description: 'Test - Standard Segment Builder - Cypress',
          object_tree_expression: 'creation_ts > $date1',
          addressable_object: 'UserPoint',
        },
      }).then(() => {
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
        }).then(responseChannel => {
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
            cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.builder').click();
            cy.wait(3000);
            cy.url().then(url => {
              if (url.match(/.*segment-builder-selector$/g))
                cy.get('.mcs-standardSegmentBuilder_dropdownContainer').click();
            });
            cy.get('.mcs-standardSegmentBuilder_totalAudience').should('not.contain', '0');
            cy.get('.mcs-timelineButton_left').click();
            cy.get('.mcs-standardSegmentBuilder_featureCard').contains(audienceFeatureName).click();
            cy.get('.mcs-standardSegmentBuilder_dashboard_refresh_button').click();
            cy.get('.mcs-standardSegmentBuilder_totalAudience').should('not.contain', '0');
            cy.get('.mcs-timelineButton_right').click();
            cy.get('.mcs-standardSegmentBuilder_featureCard').contains(audienceFeatureName).click();
            cy.get('.mcs-standardSegmentBuilder_dashboard_refresh_button').click();
            cy.get('.mcs-standardSegmentBuilder_totalAudience').should('contain', '0');
          });
        });
      });
    });
  });

  it('should test the standard segment builder using match clause', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const standardSegmentBuilderName = faker.random.words(2);
      const audienceFeatureName = faker.random.words(2);
      createStandardSegmentBuilder(data.datamartName, standardSegmentBuilderName);
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/audience_features`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          name: audienceFeatureName,
          description: 'Test - Standard Segment Builder - Cypress',
          object_tree_expression: 'accounts{match (user_account_id,$id)}',
          addressable_object: 'UserPoint',
        },
      }).then(() => {
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
        }).then(responseChannel => {
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
            cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.builder').click();
            cy.wait(3000);
            cy.url().then(url => {
              if (url.match(/.*segment-builder-selector$/g))
                cy.get('.mcs-standardSegmentBuilder_dropdownContainer').trigger('mouseover');
              cy.contains(standardSegmentBuilderName).click();
            });
            cy.get('.mcs-standardSegmentBuilder_totalAudience').should('not.contain', '0');
            cy.get('.mcs-timelineButton_left').click();
            cy.get('.mcs-standardSegmentBuilder_featureCard').contains(audienceFeatureName).click();
            cy.get('.mcs-timeline_actionDot').first().click();
            cy.get('.mcs-standardSegmentBuilder_featureCard').contains(audienceFeatureName).click();
            cy.get('.mcs-standardSegmentBuilder_audienceFeatureContent')
              .first()
              .within(() => {
                cy.get('.mcs-formSearchInput').type('test_match_audience_builder');
              });
            cy.get('.mcs-standardSegmentBuilder_dashboard_refresh_button').click();
            cy.get('.mcs-standardSegmentBuilder_totalAudience').should('not.contain', '0');
          });
        });
      });
    });
  });

  it('should test to add an audience feature from library to a standard segment builder on creation', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const standardSegmentBuilderName = faker.random.words(2);
      const audienceFeatureName = faker.random.words(2);
      createStandardSegmentBuilder(data.datamartName, standardSegmentBuilderName);
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/audience_features`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          name: audienceFeatureName,
          description: 'Test - Standard Segment Builder - Cypress',
          object_tree_expression: 'accounts{match (user_account_id,$id)}',
          addressable_object: 'UserPoint',
        },
      })
        .then(() => {
          cy.contains(standardSegmentBuilderName).click();
          cy.get('.mcs-standardSegmentBuilder_formColumn').contains('Add from library').click();
          cy.contains(audienceFeatureName).click();
          cy.get('.mcs-form_saveButton_standardSegmentBuilderForm').click();
        })
        .then(() => {
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
          });
        })
        .then(responseChannel => {
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
          });
        })
        .then(() => {
          cy.wait(20000);
          cy.goToHome(data.organisationId);
          cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
          cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.builder').click();
          cy.wait(3000);
          cy.url().then(url => {
            if (url.match(/.*segment-builder-selector$/g))
              cy.get('.mcs-standardSegmentBuilder_dropdownContainer').trigger('mouseover');
            cy.contains(standardSegmentBuilderName).click();
          });

          cy.get('.mcs-standardSegmentBuilder_totalAudience').should('not.contain', '0');

          cy.get('.mcs-standardSegmentBuilder_audienceFeatureContent').should(
            'contain',
            audienceFeatureName,
          );

          cy.get('.mcs-standardSegmentBuilder_audienceFeatureContent').should(
            'contain',
            'Test - Standard Segment Builder - Cypress',
          );

          cy.get('.mcs-standardSegmentBuilder_audienceFeatureContent').within(() => {
            cy.get('.mcs-formSearchInput').type('test_match_audience_builder{enter}');
          });

          cy.get('.mcs-standardSegmentBuilder_dashboard_refresh_button').click();
          cy.get('.mcs-standardSegmentBuilder_totalAudience').should('not.contain', '0');
        });
    });
  });

  it('should test the standard segment builder using scoreSum', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const standardSegmentBuilderName = faker.random.words(2);
      const audienceFeatureName = faker.random.words(2);
      createStandardSegmentBuilder(data.datamartName, standardSegmentBuilderName);
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/audience_features`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          name: audienceFeatureName,
          description: 'Test - Standard Segment Builder - Cypress',
          object_tree_expression:
            'activity_events @ScoreSum(min : $frequency) {nature=$event_name}',
          addressable_object: 'UserPoint',
        },
      }).then(() => {
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
        }).then(responseChannel => {
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/datamarts/${
              data.datamartId
            }/user_activities?processing_pipeline=false`,
            method: 'POST',
            headers: { Authorization: data.accessToken },
            body: {
              $user_account_id: 'test_scoreSum',
              $type: 'APP_VISIT',
              $site_id: `${responseChannel.body.data.id}`,
              $session_status: 'NO_SESSION',
              $ts: new Date().getTime(),
              $events: [
                {
                  $ts: new Date().getTime(),
                  $event_name: '$item_view',
                },
              ],
            },
          })
            .then(() => {
              cy.request({
                url: `${Cypress.env('apiDomain')}/v1/datamarts/${
                  data.datamartId
                }/user_activities?processing_pipeline=false`,
                method: 'POST',
                headers: { Authorization: data.accessToken },
                body: {
                  $user_account_id: 'test_scoreSum',
                  $type: 'APP_VISIT',
                  $site_id: `${responseChannel.body.data.id}`,
                  $session_status: 'NO_SESSION',
                  $ts: new Date().getTime(),
                  $events: [
                    {
                      $ts: new Date().getTime(),
                      $event_name: '$item_view',
                    },
                  ],
                },
              });
            })
            .then(() => {
              cy.wait(20000);
              cy.goToHome(data.organisationId);
              cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
              cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.builder').click();
              cy.wait(3000);
              cy.url().then(url => {
                if (url.match(/.*segment-builder-selector$/g))
                  cy.get('.mcs-standardSegmentBuilder_dropdownContainer').trigger('mouseover');
                cy.contains(standardSegmentBuilderName).click();
              });
              cy.get('.mcs-standardSegmentBuilder_totalAudience').should('not.contain', '0');
              cy.get('.mcs-timelineButton_left').click();
              cy.get('.mcs-standardSegmentBuilder_featureCard').contains(audienceFeatureName).click();
              cy.get('.mcs-standardSegmentBuilder_audienceFeatureContent')
                .first()
                .within(() => {
                  cy.get('.mcs-formSearchInput').type('$item_view{enter}');
                  cy.get('.mcs-standardSegmentBuilder_audienceFeatureName').click();
                  cy.get('.mcs-formInputNumber').type('2{enter}');
                });
              cy.get('.mcs-standardSegmentBuilder_dashboard_refresh_button').click();
              cy.get('.mcs-standardSegmentBuilder_totalAudience').should('contain', '1');
            });
        });
      });
    });
  });
  it('Should test the creation limit of 20 audience builders', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const audienceBuilderName = faker.random.words(2);
      for (let index = 0; index < 20; index++) {
        createAudienceBuilder(data.datamartName, audienceBuilderName);
        cy.wait(2000);
      }
      createAudienceBuilder(data.datamartName, audienceBuilderName);
      cy.get('.mcs-notifications_errorDescription')
        .should('be.visible')
        .and('contain', 'The limit of 20 authorized audience builders has been reached');
    });
  });
});
