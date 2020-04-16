/// <reference types="Cypress" />
/// <reference path="../../../../../support/index.d.ts" />

describe("Job executions", function() {
  const second = 1000;
  const organisationName = "yellow velvet";
  const datamartName = "YV Pionus";

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

  // waiting for backend

  // it("Should create a new job execution", function() {});

  // it("Table should contains one execution", function() {});

  it("Dashboard should display executions", function() {
    // This is a test with 5 mocked execution data
    // To modify when dashboard view is enabled
    cy.visit(
      Cypress.config().baseUrl +
        "/#/v2/o/504/settings/datamart/my_datamart/1162/datamart_replication/26"
    );
    cy.get(".ant-table-tbody")
      .children()
      .should("have.length", 5);
  });
});
