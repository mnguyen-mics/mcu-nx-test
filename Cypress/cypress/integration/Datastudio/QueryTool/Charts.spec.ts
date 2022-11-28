import ImportsPage from '../../../pageobjects/DataStudio/ImportsPage';
import QueryToolPage from '../../../pageobjects/DataStudio/QueryTool/QueryToolPage';

describe('Query tool - Charts', () => {
  Cypress.Cookies.defaults({
    preserve: 'authentication',
  });

  before(() => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.login();
      cy.switchOrg(data.organisationName);
      const importsPage = new ImportsPage();
      const importName = `Test Import Profiles ${Math.random().toString(36).substring(2, 10)}`;
      importsPage.goToPage();
      importsPage.clickBtnImportsCreation();
      cy.contains(data.datamartName).click();
      importsPage.importsInformation.typeImportName(importName);
      importsPage.importsInformation.selectImportType('User Profile');
      importsPage.importsInformation.selectPriority('MEDIUM');
      importsPage.importsInformation.clickBtnSaveImport();
      importsPage.clickBtnNewExecution();
      cy.fixture('00-testProfiles.ndjson').then(() => {
        cy.get('[type="file"]').attachFile('00-testProfiles.ndjson', {
          subjectType: 'drag-n-drop',
        });
      });
      // Wait between the click of the Ok button and the upload of the file so that the interface can catch up
      cy.wait(2000);
      importsPage.clickOK();
      importsPage.importExecutionTable.should('contain', 'RUNNING');
      importsPage.importExecutionTable.should('contain', 'SUCCEEDED');

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
          undefined,
          'test_query_tool_3',
        );
      });

      // Wait the elasticsearch indexation for otql request
      cy.wait(30000);
    });
  });

  beforeEach(() => {
    cy.login();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
    });
    window.localStorage.setItem('features', '["datastudio-query_tool-charts_loader"]');
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Query tool - Running queries and results display', () => {
    const queryToolPage = new QueryToolPage();
    queryToolPage.goToPage();
    queryToolPage.typeQuery(
      'SELECT {nature @map} FROM ActivityEvent where nature = "test_query_tool_1" or nature = "test_query_tool_2" or nature = "test_query_tool_3"',
    );
    queryToolPage.executeQuery();
    // check values
    queryToolPage.resultsShouldContain('test_query_tool_3');

    queryToolPage.typeQuery('SELECT {nature @map} FROM ActivityEvent');
    queryToolPage.executeQuery();
    queryToolPage.charts.clickBarIcon();
    queryToolPage.charts.shouldContain('Series 1: 2', 1);

    queryToolPage.charts.clickPercentageOption();
    queryToolPage.charts.shouldContain('Series 1: 33.33%', 1);

    /*     queryToolPage.charts.clickIndexOption();
    queryToolPage.charts.shouldContain('Series 1: 2', 1); */

    queryToolPage.charts.clickRadarIcon();
    queryToolPage.charts.shouldContain('Series 1: 2');

    queryToolPage.charts.clickPieIcon();
    queryToolPage.charts.shouldContain('33.33%');

    queryToolPage.charts.clickAreaIcon();
    queryToolPage.charts.shouldContain('Series 1: 2');

    queryToolPage.clickAddStep();
    queryToolPage.typeQuery(
      'SELECT {nature @map} FROM ActivityEvent where nature = "test_join_1" or nature = "test_join_2"',
      1,
    );
    queryToolPage.executeQuery();

    queryToolPage.charts.clickBarIcon();
    queryToolPage.charts.clickIndexOption();
    queryToolPage.charts.shouldContain('Series 1: 2', 1);

    // save
    queryToolPage.charts.clickSave();
    queryToolPage.charts.typeName();
    queryToolPage.charts.clickSubmit();

    // search for the just create chart
    queryToolPage.visualizer.clickCharts();
    queryToolPage.visualizer.shouldContain(queryToolPage.charts.name);
    cy.wait(5000);
    queryToolPage.visualizer.shouldContain('Modified by dev');
    queryToolPage.visualizer.shouldContain('0 days ago');
    queryToolPage.visualizer.shouldNotContain('Not created graph');

    // search
    queryToolPage.visualizer.search(queryToolPage.charts.name);
    queryToolPage.visualizer.shouldContain(queryToolPage.charts.name);

    // cy.reload();
    // reload saved chart
    queryToolPage.visualizer.clickOnChart(queryToolPage.charts.name);
    queryToolPage.resultsShouldContain('test_query_tool_3');
  });
});
