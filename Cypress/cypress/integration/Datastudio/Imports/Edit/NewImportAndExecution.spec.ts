import ImportsPage from '../../../../pageobjects/DataStudio/ImportsPage';

describe('New activities import and execution', () => {
  const second = 1000;

  before(() => {
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
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('access_token', 'access_token_expiration_date');
  });

  it('Generate import from files', () => {
    const importsPage = new ImportsPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const importName = `Test Import Activities ${Math.random().toString(36).substring(2, 10)}`;
      importsPage.goToPage();
      importsPage.clickBtnImportsCreation();
      cy.contains(data.datamartName).click();
      importsPage.importsInformation.typeImportName(importName);
      importsPage.importsInformation.selectUserActivityDocumentType();
      importsPage.importsInformation.selectLowPriority();
      importsPage.importsInformation.clickBtnSaveImport();
      importsPage.titleImport.should('contain', importName);
    });
  });
});
