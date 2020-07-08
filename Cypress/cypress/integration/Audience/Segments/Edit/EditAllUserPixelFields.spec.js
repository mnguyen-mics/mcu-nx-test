/// <reference types="Cypress" />
/// <reference path="../../../../support/index.d.ts" />

import cuid from "cuid";

describe("User Pixel Segment edition on all fields", function() {
  const second = 1000;
  const organisationName = "yellow velvet";

  const token = cuid();

  const datamartName = "YV Pionus";

  beforeEach(() => {
    Cypress.Cookies.preserveOnce(
      "access_token",
      "access_token_expiration_date"
    );
    // Login
    cy.login();
    cy.url({ timeout: 10 * second }).should(
      "contain",
      Cypress.config().baseUrl + "/#/v2/o/1/campaigns/display"
    );

    // Switch organisation
    cy.switchOrg(organisationName);

    //Go to Segment menu
    cy.contains("Audience").click();

    cy.contains("Segments").click();
  });

  it("Should create an User Pixel", function() {
    createSegment("User Pixel", datamartName, token);
  });

  it("Should edit an User Pixel", function() {
    editSegment("User Pixel", token);
  });
});

/*
    This function create a segment
    @in type : the type of the segment created ('pixel', 'list', 'expert query')
    @in datamart : the name of the datamart we use to create the segment
*/
function createSegment(type, datamart, token) {
  //Click on "new Segment"
  cy.contains("New Segment").click();

  //Select one Datamarts
  cy.contains(datamart).click();

  //Select Segment Types
  cy.contains(type).click();

  //Fill the name of the segement
  cy.get('[id="audienceSegment.name"]').type("Cypress Test " + token, );
  //Fill the descritpion
  cy.get('[id="audienceSegment.short_description"]').type("This segment was created to test the creation of segment.");

  //click on advanced
  cy.get('[class="button-styleless optional-section-title"]').click();

  //Fill the technical name
  cy.get('[id="audienceSegment.technical_name"]').type(
    "technical name test " + token
  );

  //Fill the default life time
  cy.get('[id="audienceSegment.defaultLiftime"]').type("1");

  //Choose day as the lifetime
  cy.get('[class ="ant-select ant-select-enabled"]').click();

  cy.contains("Days").click();

  //Save the new segment
  cy.contains("Save").click();
  //Get back on the main page
  cy.contains("Audience", {timeout: 10000}).click();

  cy.contains("Segments")
    .first()
    .click();

  cy.url().should("include", "audience/segments");
}

function editSegment(type, token) {
  cy.visit(
    Cypress.config().baseUrl +
      `/#/v2/o/504/audience/segments?currentPage=1&pageSize=10`
  );
  // search the test segment we just created
  cy.get('[placeholder="Search Segments"]')
    .type(token)
    .type("{enter}");
  // get the first segment in list
  cy.get(".mcs-campaigns-link")
    .first()
    .click();
  cy.get(".mcs-actionbar")
    .contains("Edit")
    .click();

  // Edit its name
  cy.get('[id="audienceSegment.name"]').type(" -edited");
  //Fill the descritpion
  cy.get('[id="audienceSegment.short_description"]').type(" -edited");

  //click on advanced
  cy.get('[class="button-styleless optional-section-title"]').click();

  //Fill the technical name
  cy.get('[id="audienceSegment.technical_name"]').type(" -edited");

  //Fill the default life time
  cy.get('[id="audienceSegment.defaultLiftime"]').type("2");

  //Choose day as the lifetime
  cy.get('[class ="ant-select ant-select-enabled"]').click();

  cy.contains("Days").click();

  //click on advanced
  cy.get('[class="button-styleless optional-section-title"]').click();

  //Save the new segment
  cy.contains("Save").click();

  cy.url().should("include", "audience/segments");
}
