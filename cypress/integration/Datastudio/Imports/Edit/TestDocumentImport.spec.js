/// <reference types="Cypress" />
/// <reference path="../../../../support/index.d.ts" />



/*
    Cypress e2e Activities test 
*/

describe("User Profile Import Test", function() {
  const second = 1000;
  const minutes = 60 * second;
  const organisationName = "yellow velvet";
  const datamartName = "YV Pionus";

  before(() => {
    cy.login();
    cy.url({ timeout: 10 * second }).should(
      "contain",
      Cypress.config().baseUrl + "/#/v2/o/1/campaigns/display"
    );
    cy.switchOrg(organisationName);
  });

  // Before each test, local storage is restored and document import is initiated
  beforeEach(() => {
    cy.restoreLocalStorageCache();
    cy.contains("Data Studio").click();
    cy.contains("Imports").click();
    cy.contains("New Import").click();
    cy.contains(datamartName).click();
    cy.get('[id="name"]').type("Test Document Import Cypress e2e");
    cy.get('[class="ant-select-selection__rendered"]')
      .first()
      .click();
  });

  // After each test, local storage is saved
  afterEach(() => {
    cy.saveLocalStorageCache();
  });

  // File upload
  const uploadFile = (fileName) => {
    cy.fixture(fileName).then(fileContent => {
      cy.get('[type="file"]').upload(
        {
          fileContent,
          fileName,
          mimeType: "application/json",
          encoding: "utf-8"
        },
        { force: true, subjectType: "drag-n-drop" }
      );
    });
  }

  // Document import type
  const importType = (importType) => {
    cy.contains(importType).click();
    cy.get('[class="ant-select-selection__rendered"]')
      .eq(3)
      .click();
    cy.contains("MEDIUM").click();
    cy.contains("Save").click();
    cy.contains("New Execution").click();
  };

  it("should succeed if import profile input file is valid", function() {
    importType("User Profile");
    uploadFile("00-testProfiles.ndjson");
    cy.contains("Ok").click();
    cy.get(".ant-table-row > td")
    .eq(1, { timeout: 1 * minutes })
    .should("contain", "RUNNING");
    cy.get(".ant-table-row > td")
      .eq(1, { timeout: 1 * minutes })
      .should("contain", "SUCCEEDED");
  });

  it("should succeed if import activites input file is valid", function() {
    importType("User Activity");
    uploadFile("01-testActivities.ndjson");
    cy.contains("Ok").click();
    cy.get(".ant-table-row > td")
    .eq(1, { timeout: 1 * minutes })
    .should("contain", "RUNNING");
    cy.get(".ant-table-row > td")
      .eq(1, { timeout: 1 * minutes })
      .should("contain", "SUCCEEDED");
  });

  it("should fail if import profile input file does not match user profile resource", function() {
    importType("User Profile");
    uploadFile("02-wrongData.ndjson");
    cy.contains("Ok").click();
    cy.get(".ant-notification-notice-with-icon")
      .should("contain", "Something went wrong")
      .should("be.visible");
  });
});
