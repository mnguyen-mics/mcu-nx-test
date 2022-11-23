import Tab from '../../../pageobjects/DataStudio/QueryTool/Tab';
import RightTab from '../../../pageobjects/DataStudio/QueryTool/RightTab';
import ImportsPage from '../../../pageobjects/DataStudio/ImportsPage';
import QueryToolPage from '../../../pageobjects/DataStudio/QueryTool/QueryToolPage';

describe('Query tool - Query builder', () => {
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

      // Wait the elasticsearch indexation for otql request
      cy.wait(30000);
    });
  });

  beforeEach(() => {
    cy.login();
    window.localStorage.setItem('features', '["datastudio-query_tool-charts_loader"]');
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
    });
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Elements visibility and user actions', () => {
    const queryToolPage = new QueryToolPage();
    const tab = new Tab();
    const rightTab = new RightTab();
    queryToolPage.goToPage();

    const checkSecondSeries = (numOfDimensions: number) => {
      queryToolPage.getQueriesForSeries(1).should('have.length', numOfDimensions);
      queryToolPage.getSeriesTitleButtonsWithinSeries(1).should('have.length', 1);
      queryToolPage.getSeriesTitleButtonsWithinSeries(1).eq(0).should('contain', 'Series 2');
      queryToolPage.getDimensionTitleButtonsWithinSeries(1).should('have.length', numOfDimensions);
      for (let i = 0; i < numOfDimensions; i++) {
        queryToolPage
          .getDimensionTitleButtonsWithinSeries(1)
          .eq(i)
          .should('contain', `Dimension ${i + 1}`);
      }
      queryToolPage.getNewValueButtonWithinSeries(1).should('have.length', 1);
    };

    const checkCommonParameters = (numOfDimensions: number) => {
      tab.getNewSeriesButtonByTab(0, 0).should('be.visible');
      //tab.getNewSeriesButtonByTab(0, 1).should('not.exist');
      queryToolPage.getSeriesDeleteButtons(0).should('be.visible');
      queryToolPage.getSeriesDeleteButtons(1).should('be.visible');
      queryToolPage.getDimensionDeleteButtonsWithinSeries(1).should('have.length', numOfDimensions);
      // queryToolPage.getDimensionDeleteButtonsWithinSeries(0).should('not.exist');
    };

    // tab modify the page a little
    queryToolPage.tab.clickAdd();
    queryToolPage.tab.select(1);

    // Replace query
    const query = 'SELECT {nature @map} FROM ActivityEvent';
    const defaultQuery = 'SELECT @count{} FROM UserPoint';
    queryToolPage.typeQuery(query);
    rightTab.fieldNodeContent.eq(0).should('contain', 'app_id');

    // Create a second series
    tab.getNewSeriesButtonByTab(0, 0).click();

    tab.getQueryInputByTab(0, 0).should('contain', query);
    tab.getQueryInputByTab(1, 0).should('contain', defaultQuery);
    queryToolPage.getSeriesTitleButtonsWithinSeries(0).should('be.visible');
    queryToolPage.getSeriesTitleButtonsWithinSeries(0).should('contain', 'Series 1');
    queryToolPage.getSeriesTitleButtonsWithinSeries(1).should('be.visible');
    queryToolPage.getSeriesTitleButtonsWithinSeries(1).should('contain', 'Series 2');
    //queryToolPage.getDimensionTitleButtonsWithinSeries(0).should('not.exist');
    tab.getNewValueButtonByTab(0, 0).should('be.visible');
    tab.getNewValueButtonByTab(0, 1).should('be.visible');
    tab.getNewSeriesButtonByTab(0, 0).should('be.visible');
    tab.getRemoveStepButtonByTab(0, 0).should('be.visible');
    tab.getRemoveStepButtonByTab(0, 1).should('be.visible');

    // Replace query on the second series and hit the New value button
    queryToolPage.typeQuery('SELECT @count FROM UserPoint WHERE events {}', 1);
    tab.getNewValueButtonByTab(0, 1).click();

    queryToolPage.getQueriesForSeries(0).should('have.length', 1);
    checkSecondSeries(2);
    checkCommonParameters(2);

    // In the second series, add a new query via the New value button
    queryToolPage.getNewValueButtonWithinSeries(1).eq(0).click();

    queryToolPage.getQueriesForSeries(0).should('have.length', 1);
    checkSecondSeries(3);
    checkCommonParameters(3);

    // In the second series, delete a query
    queryToolPage.getDimensionDeleteButtonsWithinSeries(1).eq(2).click();

    queryToolPage.getQueriesForSeries(0).should('have.length', 1);
    checkSecondSeries(2);
    checkCommonParameters(2);

    // Use the delete button from the second series to delete the entire series
    queryToolPage.getSeriesDeleteButtons(1).eq(0).click();

    // Use the new series button to add a third series
    tab.getNewSeriesButtonByTab(0, 0).click();
    tab.getNewSeriesButtonByTab(0, 0).click();

    queryToolPage.getSeries().should('have.length', 3);
    queryToolPage.getSeriesTitleButtonsWithinSeries(0).should('have.length', 1);
    queryToolPage.getSeriesTitleButtonsWithinSeries(0).eq(0).should('contain', 'Series 1');
    queryToolPage.getSeriesTitleButtonsWithinSeries(1).should('have.length', 1);
    queryToolPage.getSeriesTitleButtonsWithinSeries(1).eq(0).should('contain', 'Series 2');
    queryToolPage.getSeriesTitleButtonsWithinSeries(2).should('have.length', 1);
    queryToolPage.getSeriesTitleButtonsWithinSeries(2).eq(0).should('contain', 'Series 3');

    queryToolPage.getNewValueButtonWithinSeries(0).should('have.length', 1);
    queryToolPage.getNewValueButtonWithinSeries(1).should('have.length', 1);
    queryToolPage.getNewValueButtonWithinSeries(2).should('have.length', 1);

    tab.getNewSeriesButtonByTab(0, 0).should('be.visible');
    queryToolPage.getSeriesDeleteButtons(0).should('be.visible');
    queryToolPage.getSeriesDeleteButtons(1).should('be.visible');
    queryToolPage.getSeriesDeleteButtons(2).should('be.visible');

    // Delete the first series
    queryToolPage.getSeriesDeleteButtons(0).eq(0).click();
    queryToolPage.getSeries().should('have.length', 2);
    queryToolPage.getSeriesTitleButtonsWithinSeries(0).eq(0).should('contain', 'Series 2');
    queryToolPage.getSeriesTitleButtonsWithinSeries(1).eq(0).should('contain', 'Series 3');
    tab.getNewSeriesButtonByTab(0, 0).should('be.visible');
    queryToolPage.getSeriesDeleteButtons(0).should('be.visible');
    queryToolPage.getSeriesDeleteButtons(1).should('be.visible');
  });

  it('Check the Tabs management', () => {
    // Create multiple tabs with different scopes such as SELECT @count FROM
    //  UserPoint in one, SELECT @count FROM UserAgent in the second and SELECT
    //  @count FROM UserEmail in the third
    const queryToolPage = new QueryToolPage();
    queryToolPage.goToPage();
    queryToolPage.typeQuery('SELECT @count{} FROM UserPoint');
    queryToolPage.schemaVisualizer.shouldContain('accounts');
    queryToolPage.executeQuery();
    queryToolPage.resultsShouldContain('5');

    // [MICS-14520 In the query tool, "save as > technical query" works only one time properly](https://mediarithmics.atlassian.net/browse/MICS-14520)
    queryToolPage.tab.clickAdd();
    queryToolPage.typeQuery('SELECT @count{} FROM UserAgent');
    queryToolPage.schemaVisualizer.shouldContain('user_agent_info');
    queryToolPage.executeQuery();
    queryToolPage.resultsShouldContain('0');

    queryToolPage.tab.clickAdd();
    queryToolPage.typeQuery('SELECT @count{} FROM UserEmail');
    queryToolPage.schemaVisualizer.shouldContain('email');
    queryToolPage.executeQuery();
    queryToolPage.resultsShouldContain('0');

    // create multiple tabs with different queries such as SELECT {id} FROM UserPoint in one, SELECT {id} FROM UserPoint WHERE emails{} in the second and SELECT {id} FROM UserPoint WHERE events{} in the third. In each tab, hit Save as... then User query segment.
    queryToolPage.tab.select(1);
    queryToolPage.schemaVisualizer.shouldContain('accounts');
    queryToolPage.typeQuery('SELECT {id} FROM UserPoint');
    queryToolPage.executeQuery();
    queryToolPage.clickSaveAsUserQuerySegment();
    queryToolPage.saveAsUserQuerySegmentPopUp.typeName('tab1');
    queryToolPage.saveAsUserQuerySegmentPopUp.clickOk();
    queryToolPage.goToPage();

    queryToolPage.tab.select(2);
    queryToolPage.schemaVisualizer.shouldContain('user_agent_info');
    queryToolPage.typeQuery('SELECT {id} FROM UserPoint WHERE emails{}');
    queryToolPage.clickSaveAsExport();
    queryToolPage.exportPopUp.typeInInput('export name 1');
    queryToolPage.exportPopUp.clickOk();
    queryToolPage.goToPage();

    queryToolPage.tab.select(3);
    queryToolPage.schemaVisualizer.shouldContain('email');
    queryToolPage.typeQuery('SELECT {id} FROM UserPoint WHERE emails{}');
    queryToolPage.clickSaveAsUserQuerySegment();
    queryToolPage.saveAsUserQuerySegmentPopUp.clickCancel();
    queryToolPage.clickSaveAsUserQuerySegment();
    queryToolPage.saveAsUserQuerySegmentPopUp.typeName('tab3');
    queryToolPage.saveAsUserQuerySegmentPopUp.clickOk();
    queryToolPage.goToPage();
  });

  it('Error handling in multi-tabs case', () => {
    const queryToolPage = new QueryToolPage();
    queryToolPage.goToPage();

    // Create two tabs, each with one different working query and run the queries
    queryToolPage.typeQuery('select @count{} from UserAccount');
    queryToolPage.clickBtnRun();
    queryToolPage.resultsShouldContain('5');
    queryToolPage.schemaVisualizer.shouldNotContain('activity_events');

    queryToolPage.tab.clickAdd();
    queryToolPage.typeQuery('select @count{} from UserActivity');
    queryToolPage.clickBtnRun();
    queryToolPage.resultsShouldContain('0');
    queryToolPage.schemaVisualizer.shouldNotContain('activity_events');

    // Check that the first query result did not dissapeared
    queryToolPage.tab.select(1);
    queryToolPage.resultsShouldContain('5');
    queryToolPage.schemaVisualizer.shouldNotContain('activity_events');

    // In the second tab, change the query so that it is invalid and run the query
    queryToolPage.tab.select(2);
    queryToolPage.typeQuery('select @count{} from UserActivitE');
    queryToolPage.clickBtnRun();
    queryToolPage.alertErrorIsPresent();
    queryToolPage.resultMetrics.should('not.be.visible');

    // Correct the query and run it again
    queryToolPage.typeQuery('select @count{} from UserActivity');
    queryToolPage.clickBtnRun();

    // - The error message disappears
    queryToolPage.alertErrorIsMissing();

    // - The result is correctly displayed
    queryToolPage.resultsShouldContain('0');
    queryToolPage.resultMetrics.should('be.visible');
    queryToolPage.schemaVisualizer.shouldNotContain('activity_events');
  });

  it('test @cardinality query', () => {
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
          'test_cardinality_1',
          'test_cardinality_2',
        ).then(() => {
          cy.wait(30000);
          cy.executeQuery(
            data.accessToken,
            data.datamartId,
            'SELECT {nature @cardinality} FROM ActivityEvent where nature = "test_cardinality_1" or nature = "test_cardinality_2"',
          ).then(() => {
            //cy.switchOrg(data.organisationName);
            queryToolPage.goToPage();
            queryToolPage.typeQuery(
              'SELECT {nature @cardinality} FROM ActivityEvent where nature = "test_cardinality_1" or nature = "test_cardinality_2"',
            );
            queryToolPage.clickBtnRun();
            queryToolPage.resultsShouldContain('2');
            queryToolPage.resultsShouldContain('cardinality_id');
          });
        });
      });
    });
  });

  it('test table chart save and check we can edit it', () => {
    const queryToolPage = new QueryToolPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      queryToolPage.goToPage();
      queryToolPage.typeQuery('SELECT { accounts { id @map } } FROM UserPoint');
      queryToolPage.clickBtnRun();
      cy.get('.mcs-otqlInputEditor_save_button').click();
      const tableChartName = 'Test Table Chart';
      cy.get('.mcs-aggregationRenderer_chart_name').type(tableChartName);
      cy.get('.mcs-aggregationRenderer_charts_submit').click();
      queryToolPage.tab.clickAdd();
      cy.get('.ant-tabs-nav-list').contains('Charts').click({ force: true });
      cy.get('.mcs-charts-list-item').contains(tableChartName).click({ force: true });
      cy.get('.mcs-otqlInputEditor_save_button').should('contain', 'Update this chart');
    });
  });
});
