describe('User role test', () => {
  before(() => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/users`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          first_name: `fn-${Math.random().toString(36).substring(2, 10)}`,
          last_name: `ln-${Math.random().toString(36).substring(2, 10)}`,
          email: `email.-${Math.random().toString(36).substring(2, 10)}@test.com`,
          role: `READER`,
          organisation_id: data.organisationId,
          community_id: data.organisation_id,
        },
      });
    });
  });

  beforeEach(() => {
    cy.restoreLocalStorageCache();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should delete a user role', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.login();
      cy.switchOrg(data.organisationName);
      cy.goToHome(data.organisationId);

      // Click on Setting Menu
      cy.get('.mcs-navigator-header-actions-settings').click();

      // Click on User Role Menu
      cy.get('.mcs-settingsSideMenu_menu\\.organisation\\.userRoles').click();

      // Click on vertical context Menu
      cy.get('.mcs-tableActions_dropdown').click();

      // Click on delete User Role button
      cy.get('.mcs-tableActions_settings\\.organisation\\.users\\.roles\\.list\\.delete').click();

      // Assertion to check if the user roles has been correctly deleted.
      cy.get('.mcs-userRoles_table').should('contain', 'There is no User created yet!');
    });
  });
});
