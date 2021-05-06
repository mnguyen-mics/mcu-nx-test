describe('Test Automations', () => {
  beforeEach(() => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.setDataSetForAutomation(data.accessToken, data.datamartId, data.organisationId);
      cy.login();
    });
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should test the test function of an automation', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      cy.switchOrg(data.organisationName);

      // Open automation
      cy.get('.mcs-sideBar-subMenu_menu\\.automation\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.automation\\.list').click();
      cy.get('.mcs-automation-link').first().click();
      cy.get('.mcs-actionbar').find('.mcs-gears').click();
      cy.get('.mcs-content-container').should('contain', 'Test your automation');
    });
  });

  it('Should see the number of users on each node', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      cy.switchOrg(data.organisationName);

      // Open automation
      cy.get('.mcs-sideBar-subMenu_menu\\.automation\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.automation\\.list').click();
      cy.get('.mcs-automation-link').first().click();
      cy.get('.mcs-automation-userCounter').should('have.length', 5);
    });
  });
});
