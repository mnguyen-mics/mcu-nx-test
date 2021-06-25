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
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      // Go to data Studio menu
      cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();

      // Go to data Studio menu
      cy.get('.mcs-sideBar-subMenuItem_menu\\.library\\.Imports').click();

      // Create New Imports
      cy.get('.mcs-imports_creationButton').click();

      // Select the datamart

      cy.contains(data.datamartName).click();

      // Fill the name
      cy.get('.mcs-imports_nameField').type('Test import Activities');

      // Select the right document type
      cy.get(
        '.mcs-imports_selectField_edit\\.import\\.general\\.infos\\.tooltip\\.documentType',
      ).click();

      cy.get('.mcs-select_itemOption--user-activity').click();

      // Priority
      cy.get(
        '.mcs-imports_selectField_edit\\.import\\.general\\.infos\\.tooltip\\.priority',
      ).click();

      cy.get('.mcs-select_itemOption--low').click();

      // Save the import
      cy.get('.mcs-form_saveButton_importForm').click();

      cy.get('.mcs-contentHeader_title--large').should('contain', 'Test import Activities');
    });
  });
});
