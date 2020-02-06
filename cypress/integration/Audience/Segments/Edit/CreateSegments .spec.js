import cuid from "cuid";
/// <reference types="Cypress" />
/// <reference path="../../../../support/index.d.ts" />

describe("Audience Segment Form", function() {
  const second = 1000;
  const organisationName = "yellow velvet";
  const datamartName = "YV Pionus";

  beforeEach(() => {
    Cypress.Cookies.preserveOnce(
      "access_token",
      "access_token_expiration_date"
    );
    cy.viewport(1920, 1080);
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

  it("Should create User List Segment", function() {
    createSegment("User List", datamartName);
  });

  it("Should create User Pixel Segment", function() {
    createSegment("User Pixel", datamartName);
  });

  it("Should create User Expert Query Segment", function() {
    createSegment("User Expert Query", datamartName);
  });
});

function createSegment(type, datamart) {
  //Click on "new Segment"
  cy.contains("New Segment").click({ force: true });

  //Select one Datamarts
  cy.contains(datamart).click({ force: true });

  //Select Segment Types
  cy.contains(type).click();

  //Fill the name of the segement
  cy.get(
    '[id="audienceSegment.name"]'
  ).type("Test Audience Segment Form - Test " + type, { force: true });

  //Fill the descritpion
  cy.get('[id="audienceSegment.short_description"]').type(
    "This segment was created to test the creation of segment.",
    {
      force: true
    }
  );

  //click on advanced
  cy.get('[class="button-styleless optional-section-title"]').click();

  //Fill the technical name
  cy.get('[id="audienceSegment.technical_name"]').type(cuid());

  //Fill the default life time
  cy.get('[id="audienceSegment.defaultLiftime"]').type("1");

  //Choose day as the lifetime
  cy.get('[class ="ant-select ant-select-enabled"]').click();

  cy.contains("Days").click();

  //In the case that we are in user expert query, we have to write a moke query to validate
  if (type == "User Expert Query") {
    cy.get('[id="brace-editor"]')
      .find('[class="ace_text-input"]')
      .type('SELECT @count {} FROM ActivityEvent WHERE date <= "now-120d/d"', {
        force: true
      });
  }

  //Save the new segment
  cy.contains("Save").click();

  if (type === "User Expert Query") {
    // max acceptable time to wait for a form submission
    cy.wait(10000);
  } else {
    cy.wait(2000);
  }
  cy.url().should("not.contain", "create");
}
