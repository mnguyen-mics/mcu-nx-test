import cuid from "cuid";

/// <reference types="Cypress" />
/// <reference path="../../../../support/index.d.ts" />

describe("Datamart Replication edition on all fields", function() {
  const second = 1000;
  const organisationName = "yellow velvet";

  const token = cuid();

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

    //Go to Setting menu (we need better selector!)
    cy.get('[class="mcs-options"]').click();

    cy.contains("Datamart").click();

    cy.contains("Datamarts").click();

    cy.contains(datamartName).click();
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce(
      "access_token",
      "access_token_expiration_date"
    );
  });

  it("Should create a datamart replication", function() {
    createDatamartReplication("Google", token);
  });
});

function createDatamartReplication(type, token) {
  //Click on "new Segment"
  cy.contains("New Datamart Replication").click();

  //Select the replication type
  cy.contains(type).click();

  //Fill the name of the replication
  cy.get('[id="name"]').type("Cypress Test " + token);

  // select file
  cy.contains("Select a File").click();

  const dropEvent = {
    dataTransfer: {
      files: []
    }
  };

  const fileName = "03-credentialsTestFile.txt";

  cy.fixture(fileName, "binary")
    .then(Cypress.Blob.binaryStringToBlob)
    .then(fileContent =>
      cy.get('[type="file"]').upload(
        {
          fileContent,
          fileName,
          mimeType: "text/plain",
          encoding: "utf8"
        }
      )
    );

  cy.contains("Update").click();

  const projectId = cuid();
  cy.get('[id="project_id"]').type(projectId);

  const topicId = cuid();
  cy.get('[id="topic_id"]').type(topicId);

  cy.contains("Save Datamart Replication").click();

  cy.url().should("include", "settings/datamart/my_datamart");
}
