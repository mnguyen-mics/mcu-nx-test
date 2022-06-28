import faker from 'faker';

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
          cy.wait(30000);
          cy.executeQuery(
            data.accessToken,
            data.datamartId,
            'SELECT {nature @map} FROM ActivityEvent where nature = "test_charts_1" or nature = "test_charts_2"',
          ).then(() => {
            cy.switchOrg(data.organisationName);
            cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();
            cy.get('.mcs-sideBar-subMenuItem_menu\\.dataStudio\\.query').click();
            cy.get('.mcs-OTQLConsoleContainer_tabs')
              .find('.ant-tabs-nav-add')
              .eq(1)
              .click({ force: true });
            cy.get('.mcs-otqlInputEditor_otqlConsole > textarea')
              .eq(1)
              .type('{selectall}{backspace}{backspace}', {
                force: true,
              })
              .type(
                'SELECT {nature @map} FROM ActivityEvent where nature = "test_charts_1" or nature = "test_charts_2"',
                { force: true, parseSpecialCharSequences: false },
              );
            cy.get('.mcs-otqlInputEditor_run_button').eq(1).click();
            // cy.get('.mcs-otqlInputEditor_save_button').should('not.be.visible'); // To validate with pm
            cy.get('.mcs-otqlChart_icons_bar').click();
            cy.get('.mcs-otqlInputEditor_save_button').should('be.visible');
            cy.get('.mcs-otqlInputEditor_save_button').click();
            const chartName = faker.random.words(2);
            cy.get('.mcs-aggregationRenderer_chart_name').type(chartName);
            cy.get('.mcs-aggregationRenderer_charts_submit').click();
            cy.wait(1000);
            cy.get('.mcs-OTQLConsoleContainer_right-tab').eq(1).contains('Charts').click();
            cy.get('.mcs-charts-search-panel')
              .should('contain', chartName)
              .and('contain', 'Modified by dev')
              .and('contain', '0 days ago');
            const notSavedName = faker.random.words(2);
            cy.get('.mcs-charts-search-panel_search-bar')
              .find('input')
              .type(`${notSavedName}{enter}`);
            cy.get('.mcs-charts-search-panel')
              .should('not.contain', chartName)
              .and('not.contain', 'Modified by dev')
              .and('not.contain', '0 days ago');
            cy.get('.mcs-charts-search-panel_search-bar')
              .find('input')
              .clear()
              .type(`${chartName}{enter}`);
            cy.get('.mcs-charts-search-panel')
              .should('contain', chartName)
              .and('contain', 'Modified by dev')
              .and('contain', '0 days ago');
            cy.reload();
            cy.get('.mcs-OTQLConsoleContainer_tabs')
              .find('.ant-tabs-nav-add')
              .eq(1)
              .click({ force: true });
            cy.get('.mcs-OTQLConsoleContainer_right-tab').eq(1).contains('Charts').click();
            cy.contains(chartName).should('be.visible');
            cy.wait(2000);
            cy.contains(chartName).click();
            // Wait https://mediarithmics.atlassian.net/browse/MICS-13664 to be solved to complete test
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
