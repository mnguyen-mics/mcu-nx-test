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
          //cy.wait(30000);
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

            cy.get('.mcs-charts-search-panel_search-bar').find('input').type('t{enter}');
            cy.get('.mcs-charts-search-panel')
              .should('contain', 'test')
              .and('contain', 'Modified by dev')
              .and('contain', '0 days ago');
            cy.get('.mcs-charts-search-panel_search-bar').find('input').clear().type('t{enter}');
            cy.get('.mcs-charts-search-panel')
              .should('not.contain', 'test')
              .and('not.contain', 'Modified by dev')
              .and('not.contain', '0 days ago');
          });
        });
      });
    });
  });
});
