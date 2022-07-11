describe('Should test the query tool', () => {
  afterEach(() => {
    cy.clearLocalStorage();
  });

  beforeEach(() => {
    cy.login();
  });

  it('should test the query tool multi tab function', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.login();
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.dataStudio\\.query').click();
      cy.get('.mcs-otqlInputEditor_otqlConsole > textarea').type(
        '{selectall}{backspace}{backspace}',
        {
          force: true,
        },
      );
      cy.get('.mcs-otqlInputEditor_otqlConsole > textarea').type(
        'select @count{} from UserAccount',
        { force: true },
      );
      cy.get('.mcs-otqlInputEditor_run_button').click();
      cy.get('.mcs-otqlChart_resultMetrics').should('be.visible');
      cy.get('.mcs-schemaVizualize_content').should('not.contain', 'activity_events');
      cy.get('.mcs-OTQLConsoleContainer_tabs')
        .find('.ant-tabs-nav-add')
        .eq(1)
        .click({ force: true });
      cy.get('.mcs-otqlChart_resultMetrics').should('not.be.visible');
      cy.get('.mcs-schemaVizualize_content').eq(1).should('contain', 'activity_events');
      cy.get('.mcs-OTQLConsoleContainer_tabs').find('.ant-tabs-tab-remove').eq(1).click();
      cy.get('.mcs-otqlChart_resultMetrics').should('be.visible');
      cy.get('.mcs-schemaVizualize_content').should('not.contain', 'activity_events');
    });
  });

  it('test @cardinality query', () => {
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
            cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();
            cy.get('.mcs-sideBar-subMenuItem_menu\\.dataStudio\\.query').click();
            cy.get('.mcs-otqlInputEditor_otqlConsole')
              .find('textarea')
              .type('{selectall}{selectall}{backspace}{backspace}', {
                force: true,
              })
              .type(
                'SELECT {nature @cardinality} FROM ActivityEvent where nature = "test_cardinality_1" or nature = "test_cardinality_2"',
                { force: true, parseSpecialCharSequences: false },
              );
            cy.get('.mcs-otqlInputEditor_run_button').click();
            cy.get('.mcs-table-container')
              .should('contain', '2')
              .and('contain', 'cardinality_nature');
          });
        });
      });
    });
  });
});
