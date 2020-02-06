/// <reference types="Cypress" />
/// <reference path="../../../../../support/index.d.ts" />

describe("Job executions", function() {
  const second = 1000;
  const organisationName = "yellow velvet";
  const datamartName = "YV Pionus";

  before(() => {
    cy.viewport(1920, 1080);
  });

  beforeEach(() => {
    // Login
    cy.login();
    cy.url({ timeout: 10 * second }).should(
      "contain",
      Cypress.config().baseUrl + "/#/v2/o/1/campaigns/display"
    );

    // Switch organisation
    cy.switchOrg(organisationName);

    //Go to Setting menu (we need better selector!)
    cy.get('[class="mcs-options"]').click();

    cy.contains("Datamart").click();

    cy.contains("Datamarts").click();

    cy.contains(datamartName).click();
  });

  // it("Should create a new job execution", function() {});

  // it("Table should contains one execution", function() {});

  it("Dashboard should displays executions", function() {
    // waiting for PR to be merged
    cy.url().should("include", "settings/datamart/my_datamart");
  });
});
