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
      cy.contains('Data Studio').click();

      // Go to data Studio menu
      cy.contains('Imports').click();

      // Create New Imports
      cy.contains('New Import').click();

      // Select the datamart

      cy.contains(data.datamartName).click();

      // Fill the name
      cy.get('[id="name"]').type('Test import Activities');

      // Select the right document type
      cy.get('[class="ant-select-selection__rendered"').first().click();

      cy.contains('User Activity').click();

      // Priority
      cy.get('[class="ant-select-selection__rendered"').eq(3).click();

      cy.contains('LOW').click();

      // Save the import
      cy.get('[class="ant-btn mcs-primary ant-btn-primary"').first().click();
    });
  });
});
