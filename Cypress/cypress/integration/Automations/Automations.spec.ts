import ListPage from '../../pageobjects/Automations/ListPage';

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
      const listPage = new ListPage();
      cy.switchOrg(data.organisationName);

      // Open automation
      listPage.goToPage();
      listPage.clickFirtAutomationName();
      //Waiting for automation view page to load
      listPage.clickBtnTest();
      listPage.pageContent.should('contain', 'Test your automation');
    });
  });

  it('Should see the number of users on each node', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const listPage = new ListPage();
      cy.switchOrg(data.organisationName);

      // Open automation
      listPage.goToPage();
      listPage.clickFirtAutomationName();
      //Waiting for automation view page to load
      listPage.nameBar.should('be.visible');
      listPage.userCounter.should('have.length', 5);
    });
  });
});
