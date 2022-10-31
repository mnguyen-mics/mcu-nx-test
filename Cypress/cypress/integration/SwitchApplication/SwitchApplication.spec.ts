describe('This test should test the switch application button in the new topBar', () => {
  beforeEach(() => {
    cy.logout();
    cy.visit(`${Cypress.config().baseUrl}`);
    cy.login();
    cy.fixture('init_infos').then(data => {
      cy.reload();
      cy.get('.mcs-organisationListSwitcher_component', { timeout: 60000 }).click();
      cy.get('.mcs-organisationListSwitcher_searchInput').first().type(data.organisationName);
      cy.get('.mcs-organisationListSwitcher_orgId_searchView').click({ force: true });
    });
  });

  it('Should switch to computing-console with the same organisation without login again', () => {
    cy.fixture('init_infos').then(data => {
      cy.get('.mcs-header_actions_appLauncher').click();
      cy.get('.mcs_appMenu').within(() => {
        cy.contains('Navigator').click();
      });
      cy.url().should(
        'contain',
        `${Cypress.config().baseUrl}/#/v2/o/${data.organisationId}/campaigns/display`,
      );
      cy.get('.mcs_appMenu').within(() => {
        cy.contains('Computing Console').click();
      });
      cy.url().should(
        'contain',
        `https://computing-console.${Cypress.env('virtualPlatformName')}.mics-sandbox.com/#/o/${
          data.organisationId
        }/home`,
      );
      cy.get('.mcs-header_actions_appLauncher').click();
      cy.get('.mcs_appMenu').within(() => {
        cy.contains('Computing Console').click();
      });
      cy.url().should(
        'contain',
        `https://computing-console.${Cypress.env('virtualPlatformName')}.mics-sandbox.com/#/o/${
          data.organisationId
        }/home`,
      );
      cy.get('.mcs_appMenu').within(() => {
        cy.contains('Navigator').click();
      });
      cy.url().should(
        'contain',
        `${Cypress.config().baseUrl}/#/v2/o/${data.organisationId}/campaigns/display`,
      );
    });
  });
});
