/// <reference types="Cypress" />
/// <reference path="../../../../support/index.d.ts" />

describe("New activities import and execution", function() {
  const second = 1000;
  const organisationName = "yellow velvet";

  const datamartName = "YV Pionus";

  before(() => {
    // Login
    cy.login();
    cy.url({ timeout: 10 * second }).should(
      "contain",
      Cypress.config().baseUrl + "/#/v2/o/1/campaigns/display"
    );

    // Switch organisation
    cy.switchOrg(organisationName);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce(
      "access_token",
      "access_token_expiration_date"
    );
  });

  it("Generate import from files", function() {
    //Go to data Studio menu
    cy.contains("Data Studio").click();

    //Go to data Studio menu
    cy.contains("Imports").click();

    //Create New Imports
    cy.contains("New Import").click();

    //Select the datamart
    cy.contains(datamartName).click();

    //Fill the name
    cy.get('[id="name"]').type("Test import Activities");

    //Select the right document type
    cy.get('[class="ant-select-selection__rendered"')
      .first()
      .click();

    cy.contains("User Activity").click();

    // Priority
    cy.get('[class="ant-select-selection__rendered"')
      .eq(3)
      .click();

    cy.contains("LOW").click();

    //Save the import
    cy.get('[class="ant-btn mcs-primary ant-btn-primary"')
      .first()
      .click();
  });
});
