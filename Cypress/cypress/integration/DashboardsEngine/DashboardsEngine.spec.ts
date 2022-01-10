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
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/datamarts/${
            data.datamartId
          }/user_activities?processing_pipeline=false`,
          method: 'POST',
          headers: { Authorization: data.accessToken },
          body: {
            $user_account_id: 'test',
            $type: 'SITE_VISIT',
            $site_id: `${channel.body.data.id}`,
            $session_status: 'NO_SESSION',
            $ts: new Date().getTime(),
            $events: [
              {
                $event_name: 'test_engines',
                $ts: new Date().getTime(),
                $properties: {},
              },
              {
                $event_name: 'test_engines',
                $ts: new Date().getTime(),
                $properties: {},
              },
              {
                $event_name: 'test_engines',
                $ts: new Date().getTime(),
                $properties: {},
              },
            ],
          },
        }).then(() => {
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/datamarts/${
              data.datamartId
            }/user_activities?processing_pipeline=false`,
            method: 'POST',
            headers: { Authorization: data.accessToken },
            body: {
              $user_account_id: 'test',
              $type: 'SITE_VISIT',
              $site_id: `${channel.body.data.id}`,
              $session_status: 'NO_SESSION',
              $ts: new Date().getTime(),
              $events: [
                {
                  $event_name: 'test_engines_2',
                  $ts: new Date().getTime(),
                  $site_id: `${channel.body.data.id}`,
                  $properties: {},
                },
                {
                  $event_name: 'test_engines_2',
                  $ts: new Date().getTime(),
                  $site_id: `${channel.body.data.id}`,
                  $properties: {},
                },
                {
                  $event_name: 'test_engines_2',
                  $ts: new Date().getTime(),
                  $site_id: `${channel.body.data.id}`,
                  $properties: {},
                },
              ],
            },
          }).then(() => {
            cy.wait(30000);
            cy.request({
              url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/queries`,
              method: 'POST',
              headers: { Authorization: data.accessToken },
              body: {
                query_text:
                  'SELECT {nature @map} FROM ActivityEvent where nature = "test_engines" or nature = "test_engines_2"',
                datamart_id: `${data.datamartId}`,
                query_language: 'OTQL',
              },
            }).then(queryResponse => {
              const queryId = queryResponse.body.data.id;
              cy.request({
                url: `${Cypress.env('apiDomain')}/v1/datamarts/${
                  data.datamartId
                }/query_executions/otql?precision=FULL_PRECISION&use_cache=false`,
                method: 'POST',
                headers: { Authorization: data.accessToken, 'Content-Type': 'text/plain' },
                encoding: 'utf-8',
                body: 'SELECT {nature @map} FROM ActivityEvent where nature = "test_engines" or nature = "test_engines_2"',
              }).then(() => {
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
                    body: {
                      sections: [
                        {
                          title: 'First Section',
                          cards: [
                            {
                              x: 0,
                              y: 0,
                              w: 12,
                              h: 3,
                              layout: 'horizontal',
                              charts: [
                                {
                                  title: 'Bars',
                                  type: 'bars',
                                  dataset: {
                                    type: 'otql',
                                    query_id: `${queryId}`,
                                  },
                                  options: {
                                    xKey: 'key',
                                    format: 'count',
                                    yKeys: [
                                      {
                                        key: 'value',
                                        message: 'count',
                                      },
                                    ],
                                  },
                                },
                                {
                                  title: 'Metric',
                                  type: 'Metric',
                                  dataset: {
                                    type: 'activities_analytics',
                                    query_json: {
                                      dimensions: [],
                                      metrics: [
                                        {
                                          expression: 'users',
                                        },
                                      ],
                                    },
                                  },
                                },
                                {
                                  title: 'Pie',
                                  type: 'pie',
                                  dataset: {
                                    type: 'otql',
                                    query_id: `${queryId}`,
                                  },
                                  options: {
                                    legend: {
                                      enabled: true,
                                      position: 'right',
                                    },
                                    xKey: 'key',
                                    format: 'count',
                                    yKeys: [
                                      {
                                        key: 'value',
                                        message: 'count',
                                      },
                                    ],
                                  },
                                },
                              ],
                            },
                          ],
                        },
                        {
                          title: 'Second Section',
                          cards: [
                            {
                              x: 0,
                              y: 0,
                              w: 12,
                              h: 3,
                              charts: [
                                {
                                  title: 'Radar',
                                  type: 'radar',
                                  dataset: {
                                    type: 'otql',
                                    query_id: `${queryId}`,
                                  },
                                  options: {
                                    xKey: 'key',
                                    format: 'count',
                                    yKeys: [
                                      {
                                        key: 'value',
                                        message: 'count',
                                      },
                                    ],
                                  },
                                },
                                {
                                  title: 'Unknown',
                                  type: 'unknown',
                                  dataset: {
                                    type: 'otql',
                                    query_id: `${queryId}`,
                                  },
                                  options: {
                                    xKey: 'key',
                                    format: 'count',
                                    yKeys: [
                                      {
                                        key: 'value',
                                        message: 'count',
                                      },
                                    ],
                                  },
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
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
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/datamarts/${
            data.datamartId
          }/user_activities?processing_pipeline=false`,
          method: 'POST',
          headers: { Authorization: data.accessToken },
          body: {
            $user_account_id: 'test',
            $type: 'SITE_VISIT',
            $site_id: `${channel.body.data.id}`,
            $session_status: 'NO_SESSION',
            $ts: new Date().getTime(),
            $events: [
              {
                $event_name: 'test_engines',
                $ts: new Date().getTime(),
                $properties: {},
              },
              {
                $event_name: 'test_engines',
                $ts: new Date().getTime(),
                $properties: {},
              },
              {
                $event_name: 'test_engines',
                $ts: new Date().getTime(),
                $properties: {},
              },
            ],
          },
        }).then(() => {
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/datamarts/${
              data.datamartId
            }/user_activities?processing_pipeline=false`,
            method: 'POST',
            headers: { Authorization: data.accessToken },
            body: {
              $user_account_id: 'test',
              $type: 'SITE_VISIT',
              $site_id: `${channel.body.data.id}`,
              $session_status: 'NO_SESSION',
              $ts: new Date().getTime(),
              $events: [
                {
                  $event_name: 'test_engines_2',
                  $ts: new Date().getTime(),
                  $site_id: `${channel.body.data.id}`,
                  $properties: {},
                },
                {
                  $event_name: 'test_engines_2',
                  $ts: new Date().getTime(),
                  $site_id: `${channel.body.data.id}`,
                  $properties: {},
                },
                {
                  $event_name: 'test_engines_2',
                  $ts: new Date().getTime(),
                  $site_id: `${channel.body.data.id}`,
                  $properties: {},
                },
              ],
            },
          }).then(() => {
            cy.wait(30000);
            cy.request({
              url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/queries`,
              method: 'POST',
              headers: { Authorization: data.accessToken },
              body: {
                query_text:
                  'SELECT {nature @map} FROM ActivityEvent where nature = "test_engines" or nature = "test_engines_2"',
                datamart_id: `${data.datamartId}`,
                query_language: 'OTQL',
              },
            }).then(queryResponse => {
              const queryId = queryResponse.body.data.id;
              cy.request({
                url: `${Cypress.env('apiDomain')}/v1/datamarts/${
                  data.datamartId
                }/query_executions/otql?precision=FULL_PRECISION&use_cache=false`,
                method: 'POST',
                headers: { Authorization: data.accessToken, 'Content-Type': 'text/plain' },
                encoding: 'utf-8',
                body: 'SELECT {nature @map} FROM ActivityEvent where nature = "test_engines" or nature = "test_engines_2"',
              }).then(() => {
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
                    body: {
                      sections: [
                        {
                          title: 'First Section',
                          cards: [
                            {
                              x: 0,
                              y: 0,
                              w: 12,
                              h: 3,
                              layout: 'horizontal',
                              charts: [
                                {
                                  title: 'Index no options',
                                  type: 'bars',
                                  dataset: {
                                    type: 'index',
                                    sources: [
                                      {
                                        type: 'otql',
                                        series_title: 'datamart',
                                        query_id: `${queryId}`,
                                      },
                                      {
                                        type: 'otql',
                                        series_title: 'segment',
                                        query_id: `${queryId}`,
                                      },
                                    ],
                                    options: {
                                      minimum_percentage: 0,
                                    },
                                  },
                                  options: {
                                    format: 'index',
                                  },
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  }).then(() => {
                    cy.switchOrg(data.organisationName);
                    cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
                    cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.home').click();
                    cy.contains('Index Transformation').click();
                    cy.wait(20000);
                    cy.get('.mcs-card_content').eq(0).toMatchImageSnapshot();
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
