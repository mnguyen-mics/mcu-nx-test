import faker from 'faker';
import {
  differentChartsContent,
  indexTransformationContent,
  standardSegmentDashboardContent,
} from './DashboardContents';

describe('dashboards engine Tests', () => {
  beforeEach(() => {
    cy.login();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('should test that a dashboard with empty content shouldnt be displayed', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
      cy.createDashboard(
        data.accessToken,
        data.organisationId,
        'Empty Dashboard',
        ['home'],
        [],
        [],
      ).then(() => {
        cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
        cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.home').click();
        cy.get('.mcs-homePage_dashboard_page_wrapper').should('not.contain', 'Empty Dashboard');
      });
    });
  });

  it('should test the different possible charts on a dashboard', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.createChannel(
        data.accessToken,
        data.datamartId,
        'first channel',
        'test.com',
        false,
        'SITE',
      ).then(channel => {
        cy.prepareActivitiesForDashboards(
          data.accessToken,
          data.datamartId,
          channel.body.data.id,
          'test_engines',
          'test_engines_2',
        ).then(() => {
          cy.wait(30000);
          cy.createQuery(
            data.accessToken,
            data.datamartId,
            'SELECT {nature @map} FROM ActivityEvent where nature = "test_engines" or nature = "test_engines_2"',
          ).then(queryResponse => {
            const queryId = queryResponse.body.data.id;
            cy.executeQuery(
              data.accessToken,
              data.datamartId,
              'SELECT {nature @map} FROM ActivityEvent where nature = "test_engines" or nature = "test_engines_2"',
            ).then(() => {
              cy.createDashboard(
                data.accessToken,
                data.organisationId,
                'Charts types dashboard',
                ['home'],
                [],
                [],
              ).then(dashboardResponse => {
                cy.request({
                  url: `${Cypress.env('apiDomain')}/v1/dashboards/${
                    dashboardResponse.body.data.id
                  }/content`,
                  method: 'PUT',
                  headers: { Authorization: data.accessToken },
                  body: differentChartsContent(queryId),
                }).then(() => {
                  cy.switchOrg(data.organisationName);
                  cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
                  cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.home').click();
                  cy.contains('Charts types dashboard').click();
                  cy.wait(20000);
                  cy.get('.mcs-card_content').eq(0).toMatchImageSnapshot();
                  cy.get('.mcs-card_content').eq(1).toMatchImageSnapshot();
                });
              });
            });
          });
        });
      });
    });
  });

  it('should test the index transformation', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.createChannel(
        data.accessToken,
        data.datamartId,
        'first channel',
        'test.com',
        false,
        'SITE',
      ).then(channel => {
        cy.prepareActivitiesForDashboards(
          data.accessToken,
          data.datamartId,
          channel.body.data.id,
          'test_engines_3',
          'test_engines_4',
        ).then(() => {
          cy.wait(30000);
          cy.createQuery(
            data.accessToken,
            data.datamartId,
            'SELECT {nature @map} FROM ActivityEvent where nature = "test_engines_3" or nature = "test_engines_4"',
          ).then(queryResponse => {
            const queryId = queryResponse.body.data.id;
            cy.executeQuery(
              data.accessToken,
              data.datamartId,
              'SELECT {nature @map} FROM ActivityEvent where nature = "test_engines_3" or nature = "test_engines_4"',
            ).then(() => {
              cy.createDashboard(
                data.accessToken,
                data.organisationId,
                'Index Transformation',
                ['home'],
                [],
                [],
              ).then(dashboardResponse => {
                cy.request({
                  url: `${Cypress.env('apiDomain')}/v1/dashboards/${
                    dashboardResponse.body.data.id
                  }/content`,
                  method: 'PUT',
                  headers: { Authorization: data.accessToken },
                  body: indexTransformationContent(queryId),
                }).then(() => {
                  cy.switchOrg(data.organisationName);
                  cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
                  cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.home').click();
                  cy.contains('Index Transformation').click();
                  cy.wait(20000);
                  cy.get('.mcs-card_content').eq(0).toMatchImageSnapshot();
                  cy.get('.mcs-card_content').eq(1).toMatchImageSnapshot();
                });
              });
            });
          });
        });
      });
    });
  });

  it('should test the dashboard engine on the audience builder', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.createChannel(
        data.accessToken,
        data.datamartId,
        'first channel',
        'test.com',
        false,
        'SITE',
      ).then(channel => {
        cy.prepareActivitiesForDashboards(
          data.accessToken,
          data.datamartId,
          channel.body.data.id,
          'test_engines_5',
          'test_engines_6',
        ).then(() => {
          cy.wait(30000);
          cy.createQuery(
            data.accessToken,
            data.datamartId,
            'SELECT {nature @map} FROM ActivityEvent where nature = "test_engines_5" or nature = "test_engines_6"',
          ).then(queryResponse => {
            const queryId = queryResponse.body.data.id;
            cy.executeQuery(
              data.accessToken,
              data.datamartId,
              'SELECT {nature @map} FROM ActivityEvent where nature = "test_engines_5" or nature = "test_engines_6"',
            ).then(() => {
              cy.createDashboard(
                data.accessToken,
                data.organisationId,
                'Standard Segment Builder First Dashboard',
                ['builders'],
                [],
                [],
              ).then(dashboardResponse => {
                cy.request({
                  url: `${Cypress.env('apiDomain')}/v1/dashboards/${
                    dashboardResponse.body.data.id
                  }/content`,
                  method: 'PUT',
                  headers: { Authorization: data.accessToken },
                  body: standardSegmentDashboardContent(queryId),
                }).then(() => {
                  cy.switchOrg(data.organisationName);
                  const standardSegmentBuilderName = faker.random.words(2);
                  cy.get('.mcs-navigator-header-actions-settings').click();
                  cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
                  cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
                  cy.contains(data.datamartName).click();
                  cy.get('.mcs-tabs_tab--segmentBuilder').click();
                  cy.get('.mcs-standardSegmentBuilder_creation_button').click();
                  cy.get('.mcs-standardSegmentBuilderName').type(standardSegmentBuilderName);
                  cy.get('.mcs-form_saveButton_standardSegmentBuilderForm').click();
                  cy.wait(1000);
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
                    cy.get('.mcs-dashboardPage_content').should(
                      'not.contain',
                      'Standard Segment Builder First Dashboard',
                    );
                    cy.createDashboard(
                      data.accessToken,
                      data.organisationId,
                      'Standard Segment Builder Second Dashboard',
                      ['builders'],
                      [],
                      [],
                    ).then(secondDashboardResponse => {
                      cy.request({
                        url: `${Cypress.env('apiDomain')}/v1/dashboards/${
                          secondDashboardResponse.body.data.id
                        }/content`,
                        method: 'PUT',
                        headers: { Authorization: data.accessToken },
                        body: standardSegmentDashboardContent(queryId),
                      }).then(() => {
                        cy.reload();
                        cy.get('.mcs-dashboardPage_content')
                          .should('contain', 'Standard Segment Builder First Dashboard')
                          .and('contain', 'Standard Segment Builder Second Dashboard');
                        cy.createDashboard(
                          data.accessToken,
                          data.organisationId,
                          'Standard Segment Builder Third Dashboard',
                          ['builders'],
                          [],
                          [0],
                        ).then(thirdDashboardResponse => {
                          cy.request({
                            url: `${Cypress.env('apiDomain')}/v1/dashboards/${
                              thirdDashboardResponse.body.data.id
                            }/content`,
                            method: 'PUT',
                            headers: { Authorization: data.accessToken },
                            body: standardSegmentDashboardContent(queryId),
                          }).then(() => {
                            cy.reload();
                            cy.get('.mcs-dashboardPage_content')
                              .should('contain', 'Standard Segment Builder First Dashboard')
                              .and('contain', 'Standard Segment Builder Second Dashboard')
                              .and('not.contain', 'Standard Segment Builder Third Dashboard');
                            cy.createDashboard(
                              data.accessToken,
                              data.organisationId,
                              'Standard Segment Builder Fourth Dashboard',
                              ['builders'],
                              [],
                              [],
                            ).then(() => {
                              cy.reload();
                              cy.get('.mcs-dashboardPage_content')
                                .should('contain', 'Standard Segment Builder First Dashboard')
                                .and('contain', 'Standard Segment Builder Second Dashboard')
                                .and('not.contain', 'Standard Segment Builder Third Dashboard')
                                .and('not.contain', 'Standard Segment Builder Fourth Dashboard');
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  it('test the charts on the query tool', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.createChannel(
        data.accessToken,
        data.datamartId,
        'first channel',
        'test.com',
        false,
        'SITE',
      ).then(channel => {
        cy.prepareActivitiesForDashboards(
          data.accessToken,
          data.datamartId,
          channel.body.data.id,
          'test_query_tool_1',
          'test_query_tool_2',
        ).then(() => {
          cy.wait(30000);
          cy.executeQuery(
            data.accessToken,
            data.datamartId,
            'SELECT {nature @map} FROM ActivityEvent where nature = "test_query_tool_1" or nature = "test_query_tool_2"',
          ).then(() => {
            cy.switchOrg(data.organisationName);
            cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();
            cy.get('.mcs-sideBar-subMenuItem_menu\\.dataStudio\\.query').click();
            cy.get('.mcs-otqlInputEditor_otqlConsole > textarea')
              .type('{selectall}{backspace}{backspace}', {
                force: true,
              })
              .type(
                'SELECT {nature @map} FROM ActivityEvent where nature = "test_query_tool_1" or nature = "test_query_tool_2"',
                { force: true, parseSpecialCharSequences: false },
              );
            cy.get('.mcs-otqlInputEditor_run_button').click();
            cy.get('.mcs-otqlChart_icons_bar').click();
            cy.wait(1000);
            cy.get('.mcs-otqlChart_content_bar').toMatchImageSnapshot();
            cy.get('.mcs-otqlChart_icons_radar').click();
            cy.wait(1000);
            cy.get('.mcs-otqlChart_content_radar').toMatchImageSnapshot();
            cy.get('.mcs-otqlChart_icons_pie').click();
            cy.wait(1000);
            cy.get('.mcs-otqlChart_content_pie').toMatchImageSnapshot();
            cy.get('.mcs-otqlInputEditor_otqlConsole > textarea')
              .type('{selectall}{backspace}{backspace}', {
                force: true,
              })
              .type(
                'SELECT @count{nature} FROM ActivityEvent where nature = "test_query_tool_1" or nature = "test_query_tool_2"',
                { force: true, parseSpecialCharSequences: false },
              );
            cy.get('.mcs-otqlInputEditor_run_button').click();
            cy.get('.mcs-otqlChart_resultMetrics').should('contain', '6');
          });
        });
      });
    });
  });
});
