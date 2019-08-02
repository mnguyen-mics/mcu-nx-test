/// <reference types="Cypress" />
/// <reference path="../support/index.d.ts" />

context("Test - Audience Segment", () => {
  const second = 1000;
  const organisationName = "yellow velvet";
  const segmentName = " " + (Math.random() * 100).toFixed(0);

  before(() => {
    cy.viewport(1920, 1080);
    // Login
    cy.login();
    cy.url({ timeout: 10 * second }).should(
      "eq",
      Cypress.config().baseUrl +
        "/#/v2/o/1/audience/segments?currentPage=1&pageSize=10"
    );

    // Switch organisation
    cy.get(".button-styleless")
      .first()
      .trigger("mouseover");
    cy.get(".button-styleless")
      .contains("Switch Org.")
      .click();
    cy.get('[placeholder="Search Organisation"]').type(organisationName);
    cy.get(".mcs-org-card")
      .should("have.length", 1)
      .click();
    cy.get(".button-styleless")
      .first()
      .trigger("mouseout");
  });

  beforeEach(() => {
    // cy.visit('')
  });

  it("Edit an Audience Segment", () => {
    // Edit segment

    cy.visit(
      Cypress.config().baseUrl +
        `/#/v2/o/504/audience/segments?currentPage=1&pageSize=10`
    );

    const value = "test";

    // search a test segment
    cy.get('[placeholder="Search Segments"]')
      .type(value)
      .type("{enter}");

    cy.wait(5*second);
    // get the first segment in list
    cy.get(".mcs-campaigns-link").first().click();
    cy.get(".mcs-actionbar")
      .contains("Edit")
      .click({ force: true });
    // Edit its name
    cy.get('[id="audienceSegment.name"]').type(segmentName);

    // Submit form
    cy.get("form").submit();
  });
});

