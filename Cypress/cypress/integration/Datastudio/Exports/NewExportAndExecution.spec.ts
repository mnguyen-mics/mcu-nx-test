import ExportsPage from '../../../pageobjects/DataStudio/ExportsPage';

describe('Check DataStudio Export Page', () => {
  const second = 1000;

  beforeEach(() => {
    // Login
    cy.login();
    cy.url({ timeout: 10 * second }).should(
      'contain',
      Cypress.config().baseUrl + '/#/v2/o/1/campaigns/display',
    );

    // Switch organisation
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
    });

    Cypress.Cookies.preserveOnce('access_token', 'access_token_expiration_date');
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Create an export', () => {
    const exportsPage = new ExportsPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const exportName = `Test Export Activities ${Math.random().toString(36).substring(2, 10)}`;
      exportsPage.goToPage();
      exportsPage.clickBtnExportsCreation();
      cy.contains(data.datamartName).click();
      exportsPage.exportsInformation.typeExportName(exportName);
      exportsPage.exportsInformation.typeQuery('select {id} from UserProfile');
      exportsPage.exportsInformation.clickBtnSaveExport();
      exportsPage.clickExportsLink();
      exportsPage.goToExportExecutions(exportName);
    });
  });
});
