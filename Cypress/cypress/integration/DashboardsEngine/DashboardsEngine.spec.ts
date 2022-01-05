describe('dashboards engine Tests', () => {
  beforeEach(() => {
    cy.login();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  const createDashboard = (
    accessToken: string,
    organisationId: string,
    dashboardTitle: string,
    scopes: string[],
    segmentIds?: string[],
    builderIds?: string[],
  ) => {
    return cy.request({
      url: `${Cypress.env('apiDomain')}/v1/dashboards`,
      method: 'POST',
      headers: { Authorization: accessToken },
      body: {
        organisation_id: `${organisationId}`,
        community_id: `${organisationId}`,
        title: `${dashboardTitle}`,
        scopes: scopes,
        segment_ids: segmentIds,
        builder_ids: builderIds,
      },
    });
  };

  it('should test that a dashboard with empty content shouldnt be displayed', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
      createDashboard(
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
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/channels`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          name: 'first channel',
          domain: 'test.com',
          enable_analytics: false,
          type: 'SITE',
        },
      }).then(channel => {
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
                createDashboard(
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
                    cy.wait(20000);
                    cy.get('.mcs-chart').eq(0).toMatchImageSnapshot();
                    cy.get('.mcs-chart').eq(1).toMatchImageSnapshot();
                    cy.get('.mcs-chart').eq(2).toMatchImageSnapshot();
                    cy.get('.mcs-chart').eq(3).toMatchImageSnapshot();
                    cy.get('.mcs-chart').eq(4).toMatchImageSnapshot();
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
