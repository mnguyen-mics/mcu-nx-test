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
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
    });
  });

  afterEach(() => {
    cy.clearLocalStorage();
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
    const queryId1 = queryToolPage.getQueryId();

    // [MICS-14520 In the query tool, "save as > technical query" works only one time properly](https://mediarithmics.atlassian.net/browse/MICS-14520)
    // queryToolPage.getQueryId()
    queryToolPage.tab.clickAdd();
    queryToolPage.typeQuery('SELECT @count{} FROM UserAgent');
    queryToolPage.schemaVisualizer.shouldContain('user_agent_info');
    queryToolPage.executeQuery();
    queryToolPage.resultsShouldContain('0');
    const queryId2 = queryToolPage.getQueryId();

    queryToolPage.tab.clickAdd();
    queryToolPage.typeQuery('SELECT @count{} FROM UserEmail');
    queryToolPage.schemaVisualizer.shouldContain('email');
    queryToolPage.executeQuery();
    queryToolPage.resultsShouldContain('0');
    const queryId3 = queryToolPage.getQueryId();

    // create multiple tabs with different queries such as SELECT {id} FROM UserPoint in one, SELECT {id} FROM UserPoint WHERE emails{} in the second and SELECT {id} FROM UserPoint WHERE events{} in the third. In each tab, hit Save as... then User query segment.
    queryToolPage.tab.select(1);
    queryToolPage.schemaVisualizer.shouldContain('accounts');
    queryToolPage.typeQuery('SELECT {id} FROM UserPoint');
    queryToolPage.clickSaveAsUserQuerySegment();
    queryToolPage.saveAsUserQuerySegmentPopUp.clickCancel();
    queryToolPage.clickSaveAsUserQuerySegment();
    queryToolPage.saveAsUserQuerySegmentPopUp.typeName('tab1');
    queryToolPage.saveAsUserQuerySegmentPopUp.clickOk();
    cy.url({ timeout: 60000 }).should('contain', 'segment');
    queryToolPage.goToPage();

    queryToolPage.tab.select(2);
    queryToolPage.schemaVisualizer.shouldContain('user_agent_info');
    queryToolPage.typeQuery('SELECT {id} FROM UserPoint WHERE emails{}');
    queryToolPage.clickSaveAsExport();
    queryToolPage.exportPopUp.typeInInput('export name 1');
    queryToolPage.exportPopUp.clickOk();
    cy.url({ timeout: 60000 }).should('contain', 'exports');
    queryToolPage.goToPage();

    queryToolPage.tab.select(3);
    queryToolPage.schemaVisualizer.shouldContain('email');
    queryToolPage.typeQuery('SELECT {id} FROM UserPoint WHERE emails{}');
    queryToolPage.clickSaveAsUserQuerySegment();
    queryToolPage.saveAsUserQuerySegmentPopUp.clickCancel();
    queryToolPage.clickSaveAsUserQuerySegment();
    queryToolPage.saveAsUserQuerySegmentPopUp.typeName('tab3');
    queryToolPage.saveAsUserQuerySegmentPopUp.clickOk();
    cy.url({ timeout: 60000 }).should('contain', 'segment');
    queryToolPage.goToPage();

    // force synchrone test
    // cy.get('html').then(() => {
    // expect(queryId1).to.not.equal(queryId2)
    // expect(queryId1).to.not.equal(queryId3)
    // expect(queryId2).to.not.equal(queryId3)
    // });
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
});
