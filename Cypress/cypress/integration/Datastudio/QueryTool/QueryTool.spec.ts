import QueryToolPage from '../../../pageobjects/DataStudio/QueryTool/QueryToolPage';

describe('Should test the query tool', () => {
  afterEach(() => {
    cy.clearLocalStorage();
  });

  beforeEach(() => {
    cy.login();
  });

  it('should test the query tool multi tab function', () => {
    const queryToolPage = new QueryToolPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.login();
      cy.switchOrg(data.organisationName);
      queryToolPage.goToPage();
      queryToolPage.typeQuery(' ', 0);
      queryToolPage.typeQuery('select @count{} from UserAccount', 0);
      queryToolPage.clickBtnRun(0);
      queryToolPage.resultMetrics.should('be.visible');
      queryToolPage.schemaVizualize.should('not.contain', 'activity_events');
      queryToolPage.clickBtnAddQuery();
      queryToolPage.resultMetrics.should('not.be.visible');
      queryToolPage.schemaVizualize.eq(1).should('contain', 'activity_events');
      queryToolPage.clickBtnRemoveQuery();
      queryToolPage.resultMetrics.should('be.visible');
      queryToolPage.schemaVizualize.should('not.contain', 'activity_events');
    });
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
            cy.switchOrg(data.organisationName);
            queryToolPage.goToPage();
            queryToolPage.typeQuery(
              'SELECT {nature @cardinality} FROM ActivityEvent where nature = "test_cardinality_1" or nature = "test_cardinality_2"',
              0,
            );
            queryToolPage.clickBtnRun(0);
            queryToolPage.tableContainer
              .should('contain', '2')
              .and('contain', 'cardinality_nature');
          });
        });
      });
    });
  });
});
