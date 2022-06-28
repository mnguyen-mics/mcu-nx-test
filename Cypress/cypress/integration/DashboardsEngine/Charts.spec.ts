describe('Charts Tests', () => {
  beforeEach(() => {
    cy.login();
    window.localStorage.setItem('features', '["datastudio-query_tool-charts_loader"]');
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('test the charts listing on the query tool', () => {
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
          'test_charts_1',
          'test_charts_2',
        ).then(() => {
          cy.executeQuery(
            data.accessToken,
            data.datamartId,
            'SELECT {nature @map} FROM ActivityEvent where nature = "test_charts_1" or nature = "test_charts_2"',
          ).then(() => {
            cy.switchOrg(data.organisationName);
            cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();
            cy.get('.mcs-sideBar-subMenuItem_menu\\.dataStudio\\.query').click();
            cy.get('.mcs-otqlInputEditor_otqlConsole > textarea')
              .type('{selectall}{backspace}{backspace}', {
                force: true,
              })
              .type(
                'SELECT {nature @map} FROM ActivityEvent where nature = "test_charts_1" or nature = "test_charts_2"',
                { force: true, parseSpecialCharSequences: false },
              );
            cy.get('.mcs-otqlInputEditor_run_button').click();
            cy.wait(1000);
            cy.request({
              url: `${Cypress.env('apiDomain')}/v1/charts`,
              method: 'POST',
              headers: { Authorization: data.accessToken },
              body: {
                title: 'test',
                type: 'test',
                content: {
                  title: 'Index First',
                  type: 'bars',
                  dataset: {
                    type: 'index',
                    sources: [
                      {
                        type: 'otql',
                        series_title: 'datamart',
                        query_id: '`${queryId}`',
                      },
                      {
                        type: 'otql',
                        series_title: 'segment',
                        query_id: '`${queryId}`',
                      },
                    ],
                    options: {
                      minimum_percentage: 0,
                    },
                  },
                  options: {
                    format: 'index',
                    legend: {
                      position: 'bottom',
                      enabled: true,
                    },
                    bigBars: true,
                    stacking: false,
                    plotLineValue: 100,
                  },
                },
                organisation_id: `${data.organisationId}`,
              },
            });
            cy.contains('Charts').click();
            cy.get('.mcs-charts-search-panel')
              .should('contain', 'test')
              .and('contain', 'Modified by dev')
              .and('contain', '0 days ago');

            cy.get('.mcs-charts-search-panel_search-bar').find('input').type('te{enter}');
            cy.get('.mcs-charts-search-panel')
              .should('contain', 'test')
              .and('contain', 'Modified by dev')
              .and('contain', '0 days ago');
            cy.get('.mcs-charts-search-panel_search-bar').find('input').clear().type('sk{enter}');
            cy.get('.mcs-charts-search-panel')
              .should('not.contain', 'test')
              .and('not.contain', 'Modified by dev')
              .and('not.contain', '0 days ago');
          });
        });
      });
    });
  });

  it('test the charts on the query tool', () => {
    //allow access to the clipboard
    cy.wrap(
      Cypress.automation('remote:debugger:protocol', {
        command: 'Browser.grantPermissions',
        params: {
          permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
          origin: window.location.origin,
        },
      }),
    );

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
            cy.get('.mcs-otqlInputEditor_otqlConsole')
              .find('textarea')
              .type('{selectall}{selectall}{backspace}{backspace}', {
                force: true,
              })
              .type(
                'SELECT {nature @map} FROM ActivityEvent where nature = "test_query_tool_1" or nature = "test_query_tool_2"',
                { force: true, parseSpecialCharSequences: false },
              );
            cy.get('.mcs-otqlInputEditor_run_button').click();
            cy.get('.mcs-otqlChart_icons_bar').click();
            cy.wait(1000);
            cy.intercept('**/queries').as('queries');
            cy.get('.mcs-otqlChart_items_share_button').click();
            cy.wait('@queries');
            cy.window().then(async win => {
              const text = await win.navigator.clipboard.readText();
              expect(text).to.contain('"title": "",');
              expect(text).to.contain('"type": "bars');
              expect(text).to.contain('"format": "count"');
              expect(text).to.contain('"type": "bar"');
              expect(text).to.contain('"type": "OTQL"');
            });
          });
        });
      });
    });
  });
});
