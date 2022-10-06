import QueryToolPage from '../../../pageobjects/DataStudio/QueryTool/QueryToolPage';
import ImportsPage from '../../../pageobjects/DataStudio/ImportsPage';

describe('Query tool - Query builder', () => {
  Cypress.Cookies.defaults({
    preserve: 'authentication',
  });

  before(() => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.login();
      cy.switchOrg(data.organisationName);
      const importsPage = new ImportsPage();
      const importName = `Test Import Activities ${Math.random().toString(36).substring(2, 10)}`;
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

  afterEach(() => {
    // cy.clearLocalStorage();
    //Code to Handle the Sesssions in cypress.
    //Keep the Session alive when you jump to another test
    let str: string[] = [];
    cy.getCookies().then(cook => {
      for (let l = 0; l < cook.length; l++) {
        if (cook.length > 0 && l == 0) {
          str[l] = cook[l].name;
          Cypress.Cookies.preserveOnce(str[l]);
        } else if (cook.length > 1 && l > 1) {
          str[l] = cook[l].name;
          Cypress.Cookies.preserveOnce(str[l]);
        }
      }
    });
  });

  it('Check the Tabs management', () => {
    // Create multiple tabs with different scopes such as SELECT @count FROM
    //  UserPoint in one, SELECT @count FROM UserAgent in the second and SELECT
    //  @count FROM UserEmail in the third
    const queryToolPage = new QueryToolPage();
    queryToolPage.goToPage();
    queryToolPage.typeQuery('SELECT @count{} FROM UserPoint');
    queryToolPage.schemaShouldContain('accounts');
    queryToolPage.executeQuery();
    queryToolPage.resultsShouldContain('5');
    const queryId1 = queryToolPage.getQueryId();
    queryToolPage.clickSaveAsUserQuerySegment();
    queryToolPage.saveAsUserQuerySegmentPopUp.typeName('failed');
    // queryToolPage.saveAsUserQuerySegmentPopUp.clickCancel();
    // queryToolPage.clickSaveAsUserQuerySegment();
    // queryToolPage.saveAsUserQuerySegmentPopUp.typeName("failed");
    // queryToolPage.saveAsUserQuerySegmentPopUp.clickOk();

    // [MICS-14520 In the query tool, "save as > technical query" works only one time properly](https://mediarithmics.atlassian.net/browse/MICS-14520)
    // queryToolPage.getQueryId()
    queryToolPage.addTab();
    queryToolPage.typeQuery('SELECT @count{} FROM UserAgent');
    queryToolPage.schemaShouldContain('user_agent_info');
    queryToolPage.executeQuery();
    queryToolPage.resultsShouldContain('0');
    const queryId2 = queryToolPage.getQueryId();

    queryToolPage.addTab();
    queryToolPage.typeQuery('SELECT @count{} FROM UserEmail');
    queryToolPage.schemaShouldContain('email');
    queryToolPage.executeQuery();
    queryToolPage.resultsShouldContain('0');
    const queryId3 = queryToolPage.getQueryId();

    queryToolPage.selectTab(1);
    queryToolPage.schemaShouldContain('accounts');
    queryToolPage.selectTab(2);
    queryToolPage.schemaShouldContain('user_agent_info');
    queryToolPage.selectTab(3);
    queryToolPage.schemaShouldContain('email');

    // force synchrone test
    // cy.get('html').then(() => {
    // expect(queryId1).to.not.equal(queryId2)
    // expect(queryId1).to.not.equal(queryId3)
    // expect(queryId2).to.not.equal(queryId3)
    // });
  });

  it.skip('should test the query tool multi tab function', () => {
    const queryToolPage = new QueryToolPage();
    // cy.readFile('cypress/fixtures/init_infos.json').then(data => {
    // cy.login();
    // cy.switchOrg(data.organisationName);
    queryToolPage.goToPage();
    queryToolPage.typeQuery(' ');
    queryToolPage.typeQuery('select @count{} from UserAccount');
    queryToolPage.clickBtnRun();
    queryToolPage.resultsShouldContain('5');
    queryToolPage.resultMetrics.should('be.visible');
    queryToolPage.schemaVizualize.should('not.contain', 'activity_events');
    queryToolPage.clickBtnAddQuery();
    queryToolPage.resultMetrics.should('not.be.visible');
    queryToolPage.schemaVizualize.eq(1).should('contain', 'activity_events');
    queryToolPage.clickBtnRemoveQuery();
    queryToolPage.resultMetrics.should('be.visible');
    queryToolPage.schemaVizualize.should('not.contain', 'activity_events');
    // });
  });

  it.skip('test @cardinality query', () => {
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
            cy.switchOrg(data.organisationName);
            queryToolPage.goToPage();
            queryToolPage.typeQuery(
              'SELECT {nature @cardinality} FROM ActivityEvent where nature = "test_cardinality_1" or nature = "test_cardinality_2"',
              0,
            );
            queryToolPage.clickBtnRun();
            queryToolPage.tableContainer
              .should('contain', '2')
              .and('contain', 'cardinality_nature');
          });
        });
      });
    });
  });
});
