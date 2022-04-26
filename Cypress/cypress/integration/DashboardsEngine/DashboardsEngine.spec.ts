import faker from 'faker';
import DashboardFilter from '../components/DashboardFilter';
import LeftMenu from '../components/LeftMenu';
import {
  compartmentFilterContent,
  dataFileContent,
  dataFileSourceContent,
  differentChartsContent,
  drawerChartDetails,
  getDecoratosTransformationContent,
  indexTransformationContent,
  otqlResponseStub,
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
        LeftMenu.goToHomePage();
        cy.get('.mcs-content-container').should('not.contain', 'Empty Dashboard');
      });
    });
  });

  it.skip('should test the different possible charts on a dashboard', () => {
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
                  LeftMenu.goToHomePage();
                  cy.contains('Charts types dashboard').click();
                  cy.wait(10000);
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

  it.skip('should test the index transformation', () => {
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
                  LeftMenu.goToHomePage();
                  cy.contains('Index Transformation').click();
                  cy.wait(10000);
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
                  cy.get('.mcs-header_actions_settings').click();
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
                        cy.get('.mcs-standardSegmentBuilder_liveDashboard')
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

  it.skip('test the charts on the query tool', () => {
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
            cy.get('.mcs-chart_content_container').eq(1).trigger('mouseover');
            cy.get('.mcs-otqlChart_content_bar').should('contain', 'count: 3');
            cy.get('.mcs-otqlChart_items_quick_option').eq(1).click();
            cy.get('.mcs-chartOptions_percentage').click();
            cy.get('.mcs-otqlChart_content_bar').should('contain', 'count: 50% (3)');
            cy.get('.mcs-otqlChart_items_quick_option').eq(1).click();
            cy.get('.mcs-chartOptions_index').click();
            cy.get('.mcs-otqlChart_content_bar').should('contain', 'count: 3');
            cy.get('.mcs-otqlChart_icons_radar').click();
            cy.wait(1000);
            cy.get('.mcs-otqlChart_content_radar');
            cy.get('.mcs-otqlChart_icons_pie').click();
            cy.wait(1000);
            cy.get('.mcs-otqlChart_content_pie');
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

  it('should test the raw data and query drawer for a chart', () => {
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
          'test_drawer',
          'test_drawer_2',
        ).then(() => {
          cy.wait(30000);
          cy.createQuery(
            data.accessToken,
            data.datamartId,
            'SELECT {nature @map} FROM ActivityEvent where nature = "test_drawer" or nature = "test_drawer_2"',
          ).then(queryResponse => {
            const queryId = queryResponse.body.data.id;
            cy.executeQuery(
              data.accessToken,
              data.datamartId,
              'SELECT {nature @map} FROM ActivityEvent where nature = "test_drawer" or nature = "test_drawer_2"',
            ).then(() => {
              cy.createDashboard(
                data.accessToken,
                data.organisationId,
                'Drawer Charts Details',
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
                  body: drawerChartDetails(queryId),
                }).then(() => {
                  cy.switchOrg(data.organisationName);
                  LeftMenu.goToHomePage();
                  cy.contains('Drawer Charts Details').click();
                  cy.wait(3000);
                  cy.contains('Bars').click();
                  cy.get('.mcs-chartMetaDataInfo_title').should('contain', 'Bars');
                  cy.get('.mcs-chartMetaDataInfo_query_item')
                    .should('have.length', 1)
                    .find('textarea')
                    .invoke('val')
                    .then(value => {
                      expect(value).to.contain(
                        'SELECT {nature @map} FROM ActivityEvent where nature = "test_drawer" or nature = "test_drawer_2"',
                      );
                    });
                  cy.get('.mcs-chartMetaDataInfo_section_title')
                    .should('contain', 'test_drawer')
                    .and('contain', 'test_drawer_2')
                    .and('contain', '3');
                  cy.get('.mcs-chartMetaDataInfo_section_button').eq(1).click();
                  cy.get('.mcs-close').click();
                  cy.contains('Metric').click();
                  cy.get('.mcs-chartMetaDataInfo_title').should('contain', 'Metric');
                  cy.get('.mcs-chartMetaDataInfo_query_item')
                    .should('have.length', 1)
                    .find('textarea')
                    .invoke('val')
                    .then(value => {
                      expect(value).to.contain('"expression": "users"');
                    });
                  cy.get('.mcs-chartMetaDataInfo_section_title')
                    .should('contain', 'count')
                    .and('contain', '1');
                  cy.get('.mcs-chartMetaDataInfo_section_button').eq(1).click();
                  cy.get('.mcs-close').click();
                  cy.contains('Pie').click();
                  cy.get('.mcs-chartMetaDataInfo_title').should('contain', 'Pie');
                  cy.get('.mcs-chartMetaDataInfo_query_item')
                    .should('have.length', 1)
                    .find('textarea')
                    .invoke('val')
                    .then(value => {
                      expect(value).to.contain(
                        'SELECT {nature @map} FROM ActivityEvent where nature = "test_drawer" or nature = "test_drawer_2"',
                      );
                    });
                  cy.get('.mcs-chartMetaDataInfo_section_title')
                    .should('contain', 'test_drawer')
                    .and('contain', 'test_drawer_2')
                    .and('contain', '3');
                  cy.get('.mcs-chartMetaDataInfo_section_button').eq(1).click();
                  cy.get('.mcs-close').click();
                  cy.contains('Index First').click();
                  cy.get('.mcs-chartMetaDataInfo_title').should('contain', 'Index First');
                  cy.get('.mcs-chartMetaDataInfo_query_item')
                    .should('have.length', 2)
                    .find('textarea')
                    .eq(0)
                    .invoke('val')
                    .then(value => {
                      expect(value).to.contain(
                        'SELECT {nature @map} FROM ActivityEvent where nature = "test_drawer" or nature = "test_drawer_2"',
                      );
                    });
                  cy.get('.mcs-chartMetaDataInfo_query_item')
                    .should('have.length', 2)
                    .find('textarea')
                    .eq(1)
                    .invoke('val')
                    .then(value => {
                      expect(value).to.contain(
                        'SELECT {nature @map} FROM ActivityEvent where nature = "test_drawer" or nature = "test_drawer_2"',
                      );
                    });
                  cy.get('.mcs-chartMetaDataInfo_section_title')
                    .should('contain', 'test_drawer')
                    .and('contain', 'test_drawer_2')
                    .and('contain', '3')
                    .and('contain', 'datamart-percentage')
                    .and('contain', 'datamart-count')
                    .and('contain', '100')
                    .and('contain', '50');
                  cy.get('.mcs-chartMetaDataInfo_section_button').eq(1).click();
                  cy.get('.mcs-close').click();
                  cy.contains('Index Hidden Axis').click();
                  cy.get('.mcs-chartMetaDataInfo_title').should('contain', 'Index Hidden Axis');
                  cy.get('.mcs-chartMetaDataInfo_query_item')
                    .should('have.length', 2)
                    .find('textarea')
                    .eq(0)
                    .invoke('val')
                    .then(value => {
                      expect(value).to.contain(
                        'SELECT {nature @map} FROM ActivityEvent where nature = "test_drawer" or nature = "test_drawer_2"',
                      );
                    });
                  cy.get('.mcs-chartMetaDataInfo_query_item')
                    .should('have.length', 2)
                    .find('textarea')
                    .eq(1)
                    .invoke('val')
                    .then(value => {
                      expect(value).to.contain(
                        'SELECT {nature @map} FROM ActivityEvent where nature = "test_drawer" or nature = "test_drawer_2"',
                      );
                    });
                  cy.get('.mcs-chartMetaDataInfo_section_title')
                    .should('contain', 'test_drawer')
                    .and('contain', 'test_drawer_2')
                    .and('contain', '3')
                    .and('contain', 'datamart-percentage')
                    .and('contain', 'datamart-count')
                    .and('contain', '100')
                    .and('contain', '50');
                  cy.get('.mcs-chartMetaDataInfo_section_button').eq(1).click();
                  cy.get('.mcs-close').click();
                });
              });
            });
          });
        });
      });
    });
  });

  it('should test the get-decorators transformation', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.createChannel(
        data.accessToken,
        data.datamartId,
        'first channel',
        'test.com',
        false,
        'SITE',
      ).then(channel => {
        cy.createChannel(
          data.accessToken,
          data.datamartId,
          'second channel',
          'test.com',
          false,
          'SITE',
        ).then(secondChannel => {
          cy.prepareActivitiesForDashboards(
            data.accessToken,
            data.datamartId,
            channel.body.data.id,
            'test_get_decorators',
            'test_get_decorators_2',
            secondChannel.body.data.id,
          ).then(() => {
            cy.wait(30000);
            cy.createQuery(
              data.accessToken,
              data.datamartId,
              `SELECT {channel_id @map} FROM UserActivity where channel_id = "${channel.body.data.id}" or channel_id = "${secondChannel.body.data.id}"`,
            ).then(queryResponse => {
              const queryId = queryResponse.body.data.id;
              cy.executeQuery(
                data.accessToken,
                data.datamartId,
                `SELECT {channel_id @map} FROM UserActivity where channel_id = "${channel.body.data.id}" or channel_id = "${secondChannel.body.data.id}"`,
              ).then(() => {
                cy.createDashboard(
                  data.accessToken,
                  data.organisationId,
                  'Get-Decorators Transformation',
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
                    body: getDecoratosTransformationContent(queryId),
                  }).then(() => {
                    cy.switchOrg(data.organisationName);
                    LeftMenu.goToHomePage();
                    cy.contains('Get-Decorators Transformation').click();
                    cy.get('.mcs-card_content')
                      .should('contain', 'first channel')
                      .and('contain', 'second channel');
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  it('should test that when we change the org the home page refreshes', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.createDashboard(
        data.accessToken,
        data.organisationId,
        'Change organisation',
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
          body: getDecoratosTransformationContent('00'),
        }).then(() => {
          cy.switchOrg(data.organisationName);
          LeftMenu.goToHomePage();
          cy.get('.mcs-homePage_dashboard_page_wrapper').should('contain', 'Change organisation');
          cy.switchOrg('dogfooding');
          cy.get('.mcs-content-container').should('not.contain', 'Change organisation');
        });
      });
    });
  });

  it('should test the dashboard filter', () => {
    const dashboardFilter = new DashboardFilter();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.createChannel(
        data.accessToken,
        data.datamartId,
        'Channel 1',
        'test.com',
        false,
        'SITE',
      ).then(channel => {
        cy.createChannel(
          data.accessToken,
          data.datamartId,
          'Second Filter channel',
          'test.com',
          false,
          'SITE',
        ).then(secondChannel => {
          cy.prepareActivitiesForDashboards(
            data.accessToken,
            data.datamartId,
            channel.body.data.id,
            'test_filter',
            'test_filter_2',
            secondChannel.body.data.id,
          ).then(() => {
            cy.wait(30000);
            cy.createQuery(
              data.accessToken,
              data.datamartId,
              `SELECT {channel_id @map} FROM UserActivity where channel_id = "${channel.body.data.id}" or channel_id = "${secondChannel.body.data.id}"`,
            ).then(queryResponse => {
              const queryId = queryResponse.body.data.id;
              cy.executeQuery(
                data.accessToken,
                data.datamartId,
                `SELECT {channel_id @map} FROM UserActivity where channel_id = "${channel.body.data.id}" or channel_id = "${secondChannel.body.data.id}"`,
              ).then(() => {
                cy.createDashboard(
                  data.accessToken,
                  data.organisationId,
                  'Dashboard Filter',
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
                    body: compartmentFilterContent(queryId),
                  }).then(() => {
                    cy.switchOrg(data.organisationName);
                    LeftMenu.goToHomePage();
                    cy.contains('Dashboard Filter').click();
                    cy.get('.mcs-chart_content_container')
                      .first()
                      .should('contain', channel.body.data.id)
                      .and('contain', secondChannel.body.data.id);
                    dashboardFilter.applyFilters(['Channel 1']);
                    cy.get('.mcs-chart_content_container')
                      .first()
                      .should('contain', channel.body.data.id)
                      .and('not.contain', secondChannel.body.data.id);
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  it.skip('should test the loading dashboard experience', () => {
    cy.intercept({ pathname: /.*\/otql.*/, method: 'POST' }, req => {
      req.reply({
        statusCode: 200,
        body: otqlResponseStub.body,
        headers: otqlResponseStub.headers,
        delayMs: 20000,
        throttleKbps: 0,
      });
    });
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.createQuery(
        data.accessToken,
        data.datamartId,
        `SELECT {channel_id @map} FROM UserActivity`,
      ).then(queryResponse => {
        cy.createDashboard(
          data.accessToken,
          data.organisationId,
          'Loading Experience',
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
            body: compartmentFilterContent(queryResponse.body.data.id),
          }).then(() => {
            cy.switchOrg(data.organisationName);
            LeftMenu.goToHomePage();
            cy.contains('Loading Experience').click();
            cy.wait(10000);
            cy.get('.mcs-chart_content_container').should('contain', 'Still loading');
          });
        });
      });
    });
  });

  it('should test the data file data source', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.createDashboard(
        data.accessToken,
        data.organisationId,
        'Data File Source Dashboard',
        ['home'],
        [],
        [],
      ).then(dashboardResponse => {
        cy.putDataFile(data.accessToken, data.organisationId, dataFileContent).then(() => {
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/dashboards/${
              dashboardResponse.body.data.id
            }/content`,
            method: 'PUT',
            headers: { Authorization: data.accessToken },
            body: dataFileSourceContent(data.organisationId),
          }).then(() => {
            cy.switchOrg(data.organisationName);
            LeftMenu.goToHomePage();
            cy.contains('Data File Source Dashboard').click();
            cy.get('.mcs-chart_content_container')
              .first()
              .should('contain', '200')
              .and('contain', '100')
              .and('contain', '300')
              .and('contain', 'Dimension 1')
              .and('contain', 'Dimension 2')
              .and('contain', 'Dimension 3');
          });
        });
      });
    });
  });

  it('test the join transformation on the query tool', () => {
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
          'test_query_tool_3',
          'test_query_tool_4',
        ).then(() => {
          cy.wait(30000);
          cy.executeQuery(
            data.accessToken,
            data.datamartId,
            'SELECT {nature @map} FROM ActivityEvent where nature = "test_query_tool_3" or nature = "test_query_tool_4"',
          ).then(() => {
            cy.switchOrg(data.organisationName);
            cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();
            cy.get('.mcs-sideBar-subMenuItem_menu\\.dataStudio\\.query').click();
            cy.get('.mcs-otqlInputEditor_otqlConsole > textarea')
              .type('{selectall}{backspace}{backspace}', {
                force: true,
              })
              .type(
                'SELECT {nature @map} FROM ActivityEvent where nature = "test_query_tool_3" or nature = "test_query_tool_4"',
                { force: true, parseSpecialCharSequences: false },
              );
            cy.get('.mcs-otqlInputEditor_run_button').click();
            cy.get('.mcs-otqlChart_icons_bar').click();
            cy.wait(1000);
            cy.get('.mcs-chart_content_container').eq(1).trigger('mouseover');
            cy.get('.mcs-otqlChart_content_bar').should('contain', 'count: 3');
            cy.get('.mcs-otqlChart_items_quick_option').eq(1).click();
            cy.get('.mcs-chartOptions_percentage').click();
            cy.get('.mcs-otqlChart_content_bar').should('contain', 'count: 50% (3)');
            cy.get('.mcs-otqlChart_items_quick_option').eq(1).click();
            cy.get('.mcs-chartOptions_index').click();
            cy.get('.mcs-otqlChart_content_bar').should('contain', 'count: 3');
            cy.get('.mcs-otqlChart_icons_radar').click();
            cy.wait(1000);
            cy.get('.mcs-otqlChart_content_radar');
            cy.get('.mcs-otqlChart_icons_pie').click();
            cy.wait(1000);
            cy.get('.mcs-otqlChart_content_pie');
            cy.get('.mcs-otqlInputEditor_newSerieButton').click();
            cy.get('.mcs-otqlInputEditor_otqlConsole > textarea')
              .eq(1)
              .type('{selectall}{backspace}{backspace}', {
                force: true,
              })
              .type(
                'SELECT {nature @map} FROM ActivityEvent where nature = "test_query_tool_3" or nature = "test_query_tool_4"',
                { force: true, parseSpecialCharSequences: false },
              );
            cy.get('.mcs-otqlInputEditor_run_button').click();
            cy.get('.mcs-otqlChart_icons_bar').click();
            cy.wait(1000);
            cy.get('.mcs-chart_content_container').eq(1).trigger('mouseover');
            cy.get('.mcs-otqlChart_content_bar')
              .should('contain', 'Serie 1: 3')
              .and('contain', 'Serie 2: 3');
          });
        });
      });
    });
  });
});
