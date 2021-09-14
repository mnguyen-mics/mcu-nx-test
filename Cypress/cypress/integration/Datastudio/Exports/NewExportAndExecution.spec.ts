describe('Check DataStudio Export Page', () => {
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

  it('Create an export', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const exportName = `Test Export Activities`;

      // Go to data Studio menu
      cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();

      // Go to Export
      cy.get('.mcs-sideBar-subMenuItem_menu\\.library\\.Exports').click();

      // Create New Export
      cy.get('.mcs-exports_creationButton').click();

      // Select the datamart
      cy.contains(data.datamartName).click();

      // Fill the name
      cy.get('.mcs-exports_exportName').type(exportName);

      // Click on otql area
      cy.get('.mcs-otql').type('select {id} from UserProfile', {
        parseSpecialCharSequences: false,
      });

      // Save the query export
      cy.get('.mcs-form_saveButton_exportForm').click();

      // Click on the link Export
      cy.get('.mcs-breadcrumb').click();

      // Search the export created
      cy.get('.mcs-search-input').type(exportName);

      // Type enter on text field
      cy.get('.mcs-search-input').type('{enter}');

      // Click on the link of the export created
      cy.get('.mcs-campaigns-link').click();
    });
  });
});
