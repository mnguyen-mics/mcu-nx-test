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

  it('Should test the standard segment builder', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const standardSegmentBuilderName = faker.random.words(2);
      const audienceFeatureName = faker.random.words(2);
      cy.get('.mcs-navigator-header-actions-settings').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
      cy.contains(data.datamartName).click();
      cy.get('.mcs-tabs_tab--segmentBuilder').click();
      cy.get('.mcs-standardSegmentBuilder_creation_button').click();
      cy.get('.mcs-standardSegmentBuilderName').type(standardSegmentBuilderName);
      cy.get('.mcs-form_saveButton_standardSegmentBuilderForm').click();
      cy.createAudienceFeature(
        audienceFeatureName,
        'creation_ts > $date1',
        'Test - Standard Segment Builder - Cypress',
        undefined,
      );
      cy.createChannel(
        data.accessToken,
        data.datamartId,
        'test',
        'test.com',
        false,
        'MOBILE_APPLICATION',
      ).then(responseChannel => {
        cy.createActivity(data.accessToken, data.datamartId, {
          $user_account_id: 'test_percentage_3',
          $type: 'APP_VISIT',
          $site_id: `${responseChannel.body.data.id}`,
          $session_status: 'NO_SESSION',
          $ts: new Date().getTime(),
          $events: [],
        }).then(() => {
          cy.goToHome(data.organisationId);
          cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
          cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.builder').click();
          cy.wait(3000);
          cy.url().then(url => {
            if (url.match(/.*segment-builder-selector$/g)) {
              cy.get('.mcs-standardSegmentBuilder_dropdownContainer').trigger('mouseover');
              // Wait for the dropdown to appear
              cy.wait(3000);
              cy.get('.mcs-standardSegmentBuilder_dropdownContainer').then($element => {
                if ($element.find('.mcs-menu-list').length > 0) {
                  console.log($element.find('.mcs-menu-list').length);
                  cy.contains(standardSegmentBuilderName).click();
                } else {
                  cy.get('.mcs-standardSegmentBuilder_dropdownContainer').click();
                }
              });
            }
          });
          cy.get('.mcs-standardSegmentBuilder_totalAudience').should('not.contain', '0');
          cy.get('.mcs-timelineButton_left').click();
          cy.get('.mcs-standardSegmentBuilder_featureCard').contains(audienceFeatureName).click();
          cy.get('.mcs-standardSegmentBuilder_AddFeatureButton').click();
          cy.get('.mcs-standardSegmentBuilder_dashboard_refresh_button').click();
          cy.get('.mcs-standardSegmentBuilder_totalAudience').should('not.contain', '0');
          cy.get('.mcs-timelineButton_right').click();
          cy.get('.mcs-standardSegmentBuilder_featureCard').contains(audienceFeatureName).click();
          cy.get('.mcs-standardSegmentBuilder_AddFeatureButton').click();
          cy.get('.mcs-standardSegmentBuilder_dashboard_refresh_button').click();
          cy.get('.mcs-standardSegmentBuilder_totalAudience').should('contain', '0');
        });
      });
    });
  });
  it('should test the standard segment builder using match clause', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const standardSegmentBuilderName = faker.random.words(2);
      const audienceFeatureName = faker.random.words(2);
      cy.createStandardSegmentBuilder(standardSegmentBuilderName);
      cy.createAudienceFeature(
        audienceFeatureName,
        'accounts{match (user_account_id,$id)}',
        'Test - Standard Segment Builder - Cypress',
        undefined,
      );
      cy.createChannel(
        data.accessToken,
        data.datamartId,
        'test',
        'test.com',
        false,
        'MOBILE_APPLICATION',
      ).then(responseChannel => {
        cy.createActivity(data.accessToken, data.datamartId, {
          $user_account_id: 'test_match_standard_segment_builder',
          $type: 'APP_VISIT',
          $site_id: `${responseChannel.body.data.id}`,
          $session_status: 'NO_SESSION',
          $ts: new Date().getTime(),
          $events: [],
        }).then(() => {
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
          cy.get('.mcs-standardSegmentBuilder_AddFeatureButton').click();
          cy.get('.mcs-timeline_actionDot').first().click();
          cy.get('.mcs-standardSegmentBuilder_featureCard').contains(audienceFeatureName).click();
          cy.get('.mcs-standardSegmentBuilder_AddFeatureButton').click();
          cy.get('.mcs-standardSegmentBuilder_audienceFeatureContent')
            .first()
            .within(() => {
              cy.get('.mcs-formSearchInput').type('test_match_standard_segment_builder');
            });
          cy.get('.mcs-standardSegmentBuilder_dashboard_refresh_button').click();
          cy.get('.mcs-standardSegmentBuilder_totalAudience').should('not.contain', '0');
        });
      });
    });
  });
  it('should test to add an audience feature from library to a standard segment builder on creation', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const standardSegmentBuilderName = faker.random.words(2);
      const audienceFeatureName = faker.random.words(2);
      cy.createStandardSegmentBuilder(standardSegmentBuilderName);
      cy.createAudienceFeature(
        audienceFeatureName,
        'accounts{match (user_account_id,$id)}',
        'Test - Standard Segment Builder - Cypress',
        undefined,
      );
      cy.get('.mcs-navigator-header-actions-settings').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
      cy.contains(data.datamartName).click();
      cy.get('.mcs-tabs_tab--segmentBuilder').click();
      cy.contains(standardSegmentBuilderName).click();
      cy.get('.mcs-standardSegmentBuilder_formColumn').contains('Add from library').click();
      cy.contains(audienceFeatureName).click();
      cy.get('.mcs-standardSegmentBuilder_AddFeatureButton').click();
      cy.get('.mcs-form_saveButton_standardSegmentBuilderForm').click();
      cy.createChannel(
        data.accessToken,
        data.datamartId,
        'test',
        'test.com',
        false,
        'MOBILE_APPLICATION',
      ).then(responseChannel => {
        cy.createActivity(data.accessToken, data.datamartId, {
          $user_account_id: 'test_match_standard_segment_builder',
          $type: 'APP_VISIT',
          $site_id: `${responseChannel.body.data.id}`,
          $session_status: 'NO_SESSION',
          $ts: new Date().getTime(),
          $events: [],
        }).then(() => {
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
            cy.get('.mcs-formSearchInput').type('test_match_standard_segment_builder{enter}');
          });

          cy.get('.mcs-standardSegmentBuilder_dashboard_refresh_button').click();
          cy.get('.mcs-standardSegmentBuilder_totalAudience').should('not.contain', '0');
        });
      });
    });
  });
  it('should test the standard segment builder using scoreSum', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const standardSegmentBuilderName = faker.random.words(2);
      const audienceFeatureName = faker.random.words(2);
      cy.createStandardSegmentBuilder(standardSegmentBuilderName);
      cy.createAudienceFeature(
        audienceFeatureName,
        'activity_events @ScoreSum(min : $frequency) {nature=$event_name}',
        'Test - Standard Segment Builder - Cypress',
        undefined,
      );
      cy.createChannel(
        data.accessToken,
        data.datamartId,
        'test',
        'test.com',
        false,
        'MOBILE_APPLICATION',
      ).then(responseChannel => {
        cy.createActivity(data.accessToken, data.datamartId, {
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
        });
        cy.createActivity(data.accessToken, data.datamartId, {
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
        })
          .then(() => {
            cy.createActivity(data.accessToken, data.datamartId, {
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
            });
          })
          .then(() => {
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
            cy.get('.mcs-standardSegmentBuilder_AddFeatureButton').click();
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
  it('Should have a pop up message when trying to delete an audience feature used in a segment or editing the object_tree_expression', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const standardSegmentBuilderName = faker.random.words(2);
      const audienceFeatureName = faker.random.words(2);
      cy.createStandardSegmentBuilder(standardSegmentBuilderName);
      cy.createAudienceFeature(
        audienceFeatureName,
        'creation_ts > $date',
        'Test - Standard Segment Builder - Cypress',
        undefined,
      );

      cy.goToHome(data.organisationId);
      cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.builder').click();
      cy.wait(3000);
      cy.url().then(url => {
        if (url.match(/.*segment-builder-selector$/g)) {
          cy.get('.mcs-standardSegmentBuilder_dropdownContainer').trigger('mouseover');
          cy.get('.mcs-standardSegmentBuilder_dropdownContainer').click();
          cy.contains(standardSegmentBuilderName).click();
        }
        cy.get('.mcs-timelineButton_left').click();
        cy.contains(audienceFeatureName).click();
        cy.get('.mcs-standardSegmentBuilder_AddFeatureButton').click();
        cy.get('.mcs-standardSegmentBuilderActionBar_saveUserQuerySegmentButton').click();
        cy.get('.mcs-standardSegmentBuilderActionBar_menuItem').click();
        cy.get('.mcs-newUserQuerySegmentSimpleForm_name_input').type('UserQuery Segment');
        cy.get('.mcs-saveAsUserQuerySegmentModal_ok_button').click();
      });
      cy.get('.mcs-navigator-header-actions-settings').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
      cy.contains(data.datamartName).click();
      cy.contains('Audience Features').click();
      cy.get('.mcs-audienceFeatureTable_dropDownMenu').last().click();
      cy.get('.mcs-audienceFeatureTable_dropDownMenu--delete').click();
      cy.get('.mcs-modal--confirmDialog')
        .should('be.visible')
        .and('contain', 'This audience feature is used in the following segments');
      cy.get('.mcs-modal--confirmDialog').within(() => {
        cy.contains('Ok').click();
      });
      cy.get('.mcs-audienceFeature_table').should('contain', audienceFeatureName);
      cy.get('.mcs-audienceFeatureTable_dropDownMenu').last().click();
      cy.get('.mcs-audienceFeatureTable_dropDownMenu--edit').click();
      cy.get('.mcs-audienceFeature_edit_query_button').click();
      cy.get('.mcs-otqlInputEditor_otqlConsole').type(
        '{selectall}{backspace}SELECT @count{} FROM UserPoint where id > $id',
      );
      cy.get('.mcs-audienceFeature_update_query').click();
      cy.get('.mcs-form_saveButton_audienceFeatureForm').click();
      cy.get('.mcs-modal--confirmDialog')
        .should('be.visible')
        .and('contain', 'This audience feature is used in segments');
      cy.get('.mcs-modal--confirmDialog').within(() => {
        cy.contains('Ok').click();
      });
      cy.get('.mcs-audienceFeature_table').should('contain', 'id > $id');
    });
  });
  it('Should be able to edit an empty UserQuerySegment saved by using the standard_segment_builder drawer', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const standardSegmentBuilderName = faker.random.words(2);
      const audienceFeatureName = faker.random.words(2);
      cy.createStandardSegmentBuilder(standardSegmentBuilderName);
      cy.createAudienceFeature(
        audienceFeatureName,
        'creation_ts > $date',
        'Test - Standard Segment Builder - Cypress',
        undefined,
      );
      cy.goToHome(data.organisationId);
      cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.builder').click();
      cy.wait(3000);
      cy.url().then(url => {
        if (url.match(/.*segment-builder-selector$/g)) {
          cy.get('.mcs-standardSegmentBuilder_dropdownContainer').trigger('mouseover');
          cy.get('.mcs-standardSegmentBuilder_dropdownContainer').click();
          cy.contains(standardSegmentBuilderName).click();
        }
        cy.get('.mcs-standardSegmentBuilderActionBar_saveUserQuerySegmentButton').click();
        cy.get('.mcs-standardSegmentBuilderActionBar_menuItem').click();
        cy.get('.mcs-newUserQuerySegmentSimpleForm_name_input').type('Empty UserQuery Segment');
        cy.get('.mcs-saveAsUserQuerySegmentModal_ok_button').click();
      });
      cy.get('.mcs-contentHeader_title--large')
        .should('be.visible')
        .and('contain', 'Empty UserQuery Segment');
      cy.get('.mcs-pen').click();
      cy.get('.mcs-editAudienceSegmentForm_editQueryButton').click();
      cy.get('.mcs-content-container')
        .should('contain', 'Standard Segment Builders')
        .and('contain', 'Choose your builder template');
      cy.get('.mcs-selector_container').contains(standardSegmentBuilderName).click();
      cy.get('.mcs-timelineButton_left').click();
      cy.contains(audienceFeatureName).click();
      cy.get('.mcs-standardSegmentBuilder_AddFeatureButton').click();
      cy.get('.mcs-actionBar_updateQueryButton').click();
      cy.get('.mcs-form_saveButton_audienceSegmentForm').click();
      cy.get('.mcs-contentHeader_title--large')
        .should('be.visible')
        .and('contain', 'Empty UserQuery Segment');
      cy.get('.mcs-contentHeader_subtitle').should('be.visible').and('contain', 'User Query');
    });
  });
});
