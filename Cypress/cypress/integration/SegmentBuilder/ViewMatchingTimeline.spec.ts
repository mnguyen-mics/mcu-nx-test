import faker from 'faker';

describe('This test should check the view matching timeline button', () => {
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
    cy.contains('Segment Builders').click();
    cy.get('.mcs-standardSegmentBuilder_creation_button').click();
    cy.get('.mcs-standardSegmentBuilderName').type(standardSegmentBuilderName);
    cy.get('.mcs-form_saveButton_standardSegmentBuilderForm').click();
  };

  it('Should test the view matching timeline button on standard segment builder', () => {
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
          object_tree_expression: 'accounts{compartment_id = $id}',
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
            cy.window().then(win => {
              cy.stub(win, 'open').as('timelinePage');
            });
            cy.get('.mcs-timelineSelector').find('.mcs-button').click();
            cy.get('@timelinePage').should(
              'be.calledWithMatch',
              /.*timeline\/user_point_id\/[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}\?datamartId*/,
            );
          });
        });
      });
    });
  });

  it('Should test the view matching timeline button on advanced segment builder', () => {
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
          object_tree_expression: 'accounts{compartment_id = $id}',
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
            cy.wait(10000);
            cy.goToHome(data.organisationId);
            cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
            cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.builder').click();
            cy.url().should('match', /.*segment-builder-selector$/g);
            cy.get('.mcs-advancedSegmentBuilder').click();
            cy.get('.mcs-card').should('not.contain', '0');
            cy.window().then(win => {
              cy.stub(win, 'open').as('timelinePage');
            });
            cy.get('.mcs-timelineSelector').find('.mcs-button').click();
            cy.get('@timelinePage').should(
              'be.calledWithMatch',
              /.*timeline\/user_point_id\/[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}\?datamartId*/,
            );
          });
        });
      });
    });
  });
});
