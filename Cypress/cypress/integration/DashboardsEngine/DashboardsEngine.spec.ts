import faker from 'faker';
import DashboardFilter from '../components/DashboardFilter';
import LeftMenu from '../../pageobjects/LeftMenu';
import HomePage from '../../pageobjects/Home/HomePage';
import QueryToolPage from '../../pageobjects/DataStudio/QueryTool/QueryToolPage';
import {
  compartmentFilterContent,
  dataFileContent,
  dataFileContentSegmentIdToken,
  dataFileSourceContent,
  dataFileSourceContentSegmentIdToken,
  differentChartsContent,
  drawerChartDetails,
  getDecoratosTransformationContent,
  indexTransformationContent,
  otqlResponseStub,
  standardSegmentDashboardContent,
} from './DashboardContents';
import DatamartsPage from '../../pageobjects/Settings/Datamart/DatamartsPage';
import BuildersPage from '../../pageobjects/Audience/BuildersPage';

describe('dashboards engine Tests', () => {
  beforeEach(() => {
    cy.login();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('should test that a dashboard with empty content shouldnt be displayed', () => {
    const homePage = new HomePage();
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
        homePage.goToPage();
        homePage.dashboardPageContainer.should('not.contain', 'Empty Dashboard');
      });
    });
  });

  it('test the charts on the query tool', () => {
    const queryToolPage = new QueryToolPage();
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
          undefined,
          'test_query_tool_3',
        ).then(() => {
          cy.wait(30000);
          cy.executeQuery(
            data.accessToken,
            data.datamartId,
            'SELECT {nature @map} FROM ActivityEvent where nature = "test_query_tool_1" or nature = "test_query_tool_2" or nature = "test_query_tool_3"',
          ).then(() => {
            cy.switchOrg(data.organisationName);
            queryToolPage.goToPage();
            queryToolPage.typeQuery(
              'SELECT {nature @map} FROM ActivityEvent where nature = "test_query_tool_1" or nature = "test_query_tool_2" or nature = "test_query_tool_3"',
              0,
            );
            queryToolPage.clickBtnRun(0);
            queryToolPage.clickBarIcon();
            cy.wait(1000);
            queryToolPage.chartContainer.eq(1).trigger('mouseover');
            queryToolPage.barContent.should('contain', 'count: 2');
            queryToolPage.clickPercentageOption();
            queryToolPage.barContent.should('contain', 'count: 33.33% (2)');
            queryToolPage.clickIndexOption();
            queryToolPage.barContent.should('contain', 'count: 2');
            queryToolPage.clickRadarIcon();
            queryToolPage.radarContent;
            queryToolPage.clickPieIcon();
            cy.wait(1000);
            queryToolPage.pieContent;
            queryToolPage.typeQuery(
              'SELECT @count{nature} FROM ActivityEvent where nature = "test_query_tool_1" or nature = "test_query_tool_2" or nature = "test_query_tool_3"',
              0,
            );
            queryToolPage.clickBtnRun(0);
            queryToolPage.resultMetrics.should('contain', '6');
          });
        });
      });
    });
  });

  it.skip('should test the different possible charts on a dashboard', () => {
    const homePage = new HomePage();
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
                  homePage.goToPage();
                  homePage.clickChartsTypesDashboard();
                  cy.wait(10000);
                  homePage.sectionDashboard.eq(0).toMatchImageSnapshot();
                  homePage.sectionDashboard.eq(1).toMatchImageSnapshot();
                });
              });
            });
          });
        });
      });
    });
  });

  it.skip('should test the index transformation', () => {
    const homePage = new HomePage();
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
                  homePage.goToPage();
                  homePage.clickIndexTransformation();
                  cy.wait(10000);
                  homePage.sectionDashboard.eq(0).toMatchImageSnapshot();
                  homePage.sectionDashboard.eq(1).toMatchImageSnapshot();
                });
              });
            });
          });
        });
      });
    });
  });

  it('should test the dashboard engine on the audience builder', () => {
    const datamartsPage = new DatamartsPage();
    const buildersPage = new BuildersPage();
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
                  datamartsPage.goToPage();
                  cy.contains(data.datamartName).click();
                  datamartsPage.clickStandardSegmentBuilder();
                  datamartsPage.clickBtnNewStandardSegmentBuilder();
                  datamartsPage.typeStandardSegmentBuilderName(standardSegmentBuilderName);
                  datamartsPage.clickBtnSave();
                  cy.wait(1000);
                  cy.goToHome(data.organisationId);
                  buildersPage.goToPage();
                  cy.wait(3000);
                  cy.url().then(url => {
                    if (url.match(/.*segment-builder-selector$/g)) {
                      buildersPage.standardSegmentBuilder.trigger('mouseover');
                      // Wait for the dropdown to appear
                      cy.wait(3000);
                      buildersPage.standardSegmentBuilder.then($element => {
                        if ($element.find('.mcs-menu-list').length > 0) {
                          console.log($element.find('.mcs-menu-list').length);
                          cy.contains(standardSegmentBuilderName).click();
                        } else {
                          buildersPage.standardSegmentBuilder.click();
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
                        cy.wait(1000);
                        cy.reload();
                        cy.wait(1000);
                        buildersPage.liveDashboard
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
                            buildersPage.dashboardPageContent
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
                              buildersPage.dashboardPageContent
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

  it('should test the raw data and query drawer for a chart', () => {
    const homePage = new HomePage();
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
                  homePage.goToPage();
                  cy.contains('Drawer Charts Details').click();
                  cy.wait(3000);
                  homePage.clickBtnBars();
                  homePage.dataInformationPage.dataInfoTitle.should('contain', 'Bars');
                  homePage.dataInformationPage.dataInfoQuery
                    .should('have.length', 1)
                    .find('textarea')
                    .invoke('val')
                    .then(value => {
                      expect(value).to.contain(
                        'SELECT {nature @map} FROM ActivityEvent where nature = "test_drawer" or nature = "test_drawer_2"',
                      );
                    });
                  homePage.dataInformationPage.dataInfoSectionTitle
                    .should('contain', 'test_drawer')
                    .and('contain', 'test_drawer_2')
                    .and('contain', '3');
                  homePage.dataInformationPage.clickExportToCSV();
                  homePage.dataInformationPage.clickBtnClose();
                  cy.contains('Metric').click();
                  homePage.dataInformationPage.dataInfoTitle.should('contain', 'Metric');
                  homePage.dataInformationPage.dataInfoQuery
                    .should('have.length', 1)
                    .find('textarea')
                    .invoke('val')
                    .then(value => {
                      expect(value).to.contain('"expression": "users"');
                    });
                  homePage.dataInformationPage.dataInfoSectionTitle
                    .should('contain', 'count')
                    .and('contain', '1');
                  homePage.dataInformationPage.clickExportToCSV();
                  homePage.dataInformationPage.clickBtnClose();
                  cy.contains('Pie').click();
                  homePage.dataInformationPage.dataInfoTitle.should('contain', 'Pie');
                  homePage.dataInformationPage.dataInfoQuery
                    .should('have.length', 1)
                    .find('textarea')
                    .invoke('val')
                    .then(value => {
                      expect(value).to.contain(
                        'SELECT {nature @map} FROM ActivityEvent where nature = "test_drawer" or nature = "test_drawer_2"',
                      );
                    });
                  homePage.dataInformationPage.dataInfoSectionTitle
                    .should('contain', 'test_drawer')
                    .and('contain', 'test_drawer_2')
                    .and('contain', '3');
                  homePage.dataInformationPage.clickExportToCSV();
                  homePage.dataInformationPage.clickBtnClose();
                  cy.contains('Index First').click();
                  homePage.dataInformationPage.dataInfoTitle.should('contain', 'Index First');
                  homePage.dataInformationPage.dataInfoQuery
                    .should('have.length', 2)
                    .find('textarea')
                    .eq(0)
                    .invoke('val')
                    .then(value => {
                      expect(value).to.contain(
                        'SELECT {nature @map} FROM ActivityEvent where nature = "test_drawer" or nature = "test_drawer_2"',
                      );
                    });
                  homePage.dataInformationPage.dataInfoQuery
                    .should('have.length', 2)
                    .find('textarea')
                    .eq(1)
                    .invoke('val')
                    .then(value => {
                      expect(value).to.contain(
                        'SELECT {nature @map} FROM ActivityEvent where nature = "test_drawer" or nature = "test_drawer_2"',
                      );
                    });
                  homePage.dataInformationPage.dataInfoSectionTitle
                    .should('contain', 'test_drawer')
                    .and('contain', 'test_drawer_2')
                    .and('contain', '3')
                    .and('contain', 'datamart-percentage')
                    .and('contain', 'datamart-count')
                    .and('contain', '100')
                    .and('contain', '50');
                  homePage.dataInformationPage.clickExportToCSV();
                  homePage.dataInformationPage.clickBtnClose();
                  cy.contains('Index Hidden Axis').click();
                  homePage.dataInformationPage.dataInfoTitle.should('contain', 'Index Hidden Axis');
                  homePage.dataInformationPage.dataInfoQuery
                    .should('have.length', 2)
                    .find('textarea')
                    .eq(0)
                    .invoke('val')
                    .then(value => {
                      expect(value).to.contain(
                        'SELECT {nature @map} FROM ActivityEvent where nature = "test_drawer" or nature = "test_drawer_2"',
                      );
                    });
                  homePage.dataInformationPage.dataInfoQuery
                    .should('have.length', 2)
                    .find('textarea')
                    .eq(1)
                    .invoke('val')
                    .then(value => {
                      expect(value).to.contain(
                        'SELECT {nature @map} FROM ActivityEvent where nature = "test_drawer" or nature = "test_drawer_2"',
                      );
                    });
                  homePage.dataInformationPage.dataInfoSectionTitle
                    .should('contain', 'test_drawer')
                    .and('contain', 'test_drawer_2')
                    .and('contain', '3')
                    .and('contain', 'datamart-percentage')
                    .and('contain', 'datamart-count')
                    .and('contain', '100')
                    .and('contain', '50');
                  homePage.dataInformationPage.clickExportToCSV();
                  homePage.dataInformationPage.clickBtnClose();
                });
              });
            });
          });
        });
      });
    });
  });

  it('should test the get-decorators transformation', () => {
    const homePage = new HomePage();
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
                    homePage.goToPage();
                    cy.contains('Get-Decorators Transformation').click();
                    homePage.sectionDashboard
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
    const homePage = new HomePage();
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
          homePage.goToPage();
          homePage.dashboardPageWrapper.should('contain', 'Change organisation');
          cy.switchOrg('dogfooding');
          homePage.dashboardPageContainer.should('not.contain', 'Change organisation');
        });
      });
    });
  });

  it('should test the dashboard filter', () => {
    const homePage = new HomePage();
    const queryToolPage = new QueryToolPage();
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
                    homePage.goToPage();
                    cy.contains('Dashboard Filter').click();
                    queryToolPage.chartContainer
                      .first()
                      .should('contain', channel.body.data.id)
                      .and('contain', secondChannel.body.data.id);
                    dashboardFilter.applyFilters(['Channel 1']);
                    queryToolPage.chartContainer
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

  it('should test the loading dashboard experience', () => {
    const homePage = new HomePage();
    const queryToolPage = new QueryToolPage();
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
            cy.intercept('**/dashboards**').as('dashboard');
            homePage.goToPage();
            cy.wait('@dashboard');
            cy.wait(10000);
            homePage.clickLoadingExperience();
            queryToolPage.chartContainer.should('contain', 'Still loading');
          });
        });
      });
    });
  });

  it('should test the data file data source', () => {
    const homePage = new HomePage();
    const queryToolPage = new QueryToolPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.createDashboard(
        data.accessToken,
        data.organisationId,
        'Data File Source Dashboard',
        ['home'],
        [],
        [],
      ).then(dashboardResponse => {
        cy.putDataFile(
          data.accessToken,
          data.organisationId,
          dataFileContent,
          'dashboard-1.json',
        ).then(() => {
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/dashboards/${
              dashboardResponse.body.data.id
            }/content`,
            method: 'PUT',
            headers: { Authorization: data.accessToken },
            body: dataFileSourceContent(data.organisationId),
          }).then(() => {
            cy.switchOrg(data.organisationName);
            homePage.goToPage();
            cy.contains('Data File Source Dashboard').click();
            queryToolPage.chartContainer
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
    const homePage = new HomePage();
    const queryToolPage = new QueryToolPage();
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
          'test_join_1',
          'test_join_2',
        ).then(() => {
          cy.wait(30000);
          cy.executeQuery(
            data.accessToken,
            data.datamartId,
            'SELECT {nature @map} FROM ActivityEvent where nature = "test_join_1" or nature = "test_join_2"',
          ).then(() => {
            cy.switchOrg(data.organisationName);
            queryToolPage.goToPage();
            queryToolPage.typeQuery(
              'SELECT {nature @map} FROM ActivityEvent where nature = "test_join_1" or nature = "test_join_2"',
              0,
            );
            queryToolPage.clickBtnRun(0);
            queryToolPage.clickBarIcon();
            cy.wait(1000);
            queryToolPage.chartContainer.eq(1).trigger('mouseover');
            queryToolPage.barContent.should('contain', 'count: 3');
            queryToolPage.clickPercentageOption();
            queryToolPage.barContent.should('contain', 'count: 50% (3)');
            queryToolPage.clickIndexOption();
            queryToolPage.barContent.should('contain', 'count: 3');
            queryToolPage.clickRadarIcon();
            cy.wait(1000);
            queryToolPage.radarContent;
            queryToolPage.clickPieIcon();
            cy.wait(1000);
            queryToolPage.pieContent;
            homePage.clickBtnAddStep();
            queryToolPage.typeQuery(
              'SELECT {nature @map} FROM ActivityEvent where nature = "test_join_1" or nature = "test_join_2"',
              1,
            );
            queryToolPage.clickBtnRun(0);
            queryToolPage.clickBarIcon();
            cy.wait(1000);
            queryToolPage.chartContainer.eq(1).trigger('mouseover');
            queryToolPage.barContent.should('contain', 'Series 1: 3').and('contain', 'Series 2: 3');
          });
        });
      });
    });
  });

  it('should test the to-list transformation on the query tool', () => {
    const homePage = new HomePage();
    const queryToolPage = new QueryToolPage();
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
          'test_to_list_1',
          'test_to_list_2',
        ).then(() => {
          cy.wait(30000);
          cy.executeQuery(
            data.accessToken,
            data.datamartId,
            'SELECT @count{} FROM ActivityEvent where nature = "test_to_list_1" or nature = "test_to_list_2"',
          ).then(() => {
            cy.switchOrg(data.organisationName);
            queryToolPage.goToPage();
            queryToolPage.typeQuery(
              'SELECT @count{} FROM ActivityEvent where nature = "test_to_list_1" or nature = "test_to_list_2"',
              0,
            );
            homePage.clickBtnNewValue();
            cy.get('.mcs-otqlInputEditor_otqlConsole > textarea')
              .eq(1)
              .type('{selectall}{backspace}{backspace}', {
                force: true,
              })
              .type(
                'SELECT @count{} FROM ActivityEvent where nature = "test_to_list_1" or nature = "test_to_list_2"',
                { force: true, parseSpecialCharSequences: false },
              );
            homePage.clickBtnStepName();
            homePage.typeNameStep('Dimension Test{enter}');
            queryToolPage.clickBtnRun(0);
            queryToolPage.clickBarIcon();
            cy.wait(1000);
            queryToolPage.chartContainer.eq(1).trigger('mouseover');
            queryToolPage.barContent.should('contain', 'Dimension Test').and('contain', 'count: 6');
            queryToolPage.clickPercentageOption();
            queryToolPage.barContent.should('contain', 'count: 50% (6)');
          });
        });
      });
    });
  });

  it('the {segment_id} token shouldnt work in the home page', () => {
    const homePage = new HomePage();
    const queryToolPage = new QueryToolPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.createDashboard(data.accessToken, data.organisationId, 'tempo', ['home'], [], []);
      cy.createDashboard(
        data.accessToken,
        data.organisationId,
        'Segment Id Token',
        ['home'],
        [],
        [],
      ).then(dashboardResponse => {
        cy.putDataFile(
          data.accessToken,
          data.organisationId,
          dataFileContentSegmentIdToken('test'),
          'dashboard-1.json',
        ).then(() => {
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/dashboards/${
              dashboardResponse.body.data.id
            }/content`,
            method: 'PUT',
            headers: { Authorization: data.accessToken },
            body: dataFileSourceContentSegmentIdToken(data.organisationId, 'test'),
          }).then(() => {
            cy.switchOrg(data.organisationName);
            homePage.goToPage();
            cy.contains('Segment Id Token').click();
            queryToolPage.chartContainer.first().should('not.contain', '200');
          });
        });
      });
    });
  });

  it('test the {segment_id} token on the segments dashboards', () => {
    const queryToolPage = new QueryToolPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.createDashboard(
        data.accessToken,
        data.organisationId,
        'Segment Id Token',
        ['segments'],
        [],
        [],
      ).then(dashboardResponse => {
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/audience_segments?organisation_id=${
            data.organisationId
          }`,
          method: 'POST',
          headers: { Authorization: data.accessToken },
          body: {
            datamart_id: data.datamartId,
            type: 'USER_LIST',
            name: 'First segment token test',
            persisted: 'true',
            feed_type: 'FILE_IMPORT',
          },
        }).then(segmentResponse => {
          const firstSegmentId = segmentResponse.body.data.id;
          cy.putDataFile(
            data.accessToken,
            data.organisationId,
            dataFileContentSegmentIdToken(firstSegmentId),
            `dashboard-${firstSegmentId}-1.json`,
          ).then(() => {
            cy.request({
              url: `${Cypress.env('apiDomain')}/v1/dashboards/${
                dashboardResponse.body.data.id
              }/content`,
              method: 'PUT',
              headers: { Authorization: data.accessToken },
              body: dataFileSourceContentSegmentIdToken(data.organisationId, firstSegmentId),
            }).then(() => {
              cy.switchOrg(data.organisationName);
              LeftMenu.goToSegmentsPage();
              cy.contains('First segment token test').click();
              cy.contains('Segment Id Token').click();
              cy.wait(1000);
              queryToolPage.chartContainer
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
  });
});
