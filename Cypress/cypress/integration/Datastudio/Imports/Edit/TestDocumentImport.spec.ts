import faker from 'faker';

describe('User Profile Import Test', () => {
  const loginAndInitiateDocImportCreation = () => {
    cy.login();
    cy.url().should('contain', Cypress.config().baseUrl + '/#/v2/o/1/campaigns/display');
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
      cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.library\\.Imports').click();
      cy.get('.mcs-imports_creationButton').click();
      cy.contains(data.datamartName).click();
      cy.get('[id="name"]').type(faker.random.words(2));
      cy.get('.mcs-imports_selectField_edit\\.import\\.general\\.infos\\.tooltip\\.documentType')
        .first()
        .click();
    });
  };

  beforeEach(() => {
    loginAndInitiateDocImportCreation();
  });

  // After each test, local storage is saved
  afterEach(() => {
    cy.clearLocalStorage();
  });

  // File upload
  const uploadFile = (fileName: string) => {
    cy.fixture(fileName).then(() => {
      cy.get('[type="file"]').attachFile(fileName, {
        subjectType: 'drag-n-drop',
      });
    });
  };

  // Document import type
  const importTypeFunc = (importType: string | number | RegExp) => {
    cy.contains(importType).click();
    cy.get('.mcs-imports_selectField_edit\\.import\\.general\\.infos\\.tooltip\\.priority')
      .first()
      .click();
    cy.contains('MEDIUM').click();
    cy.get('.mcs-form_saveButton_importForm').click();
    cy.get('.mcs-importExecution_newExecution').click();
  };

  it('should succeed if import profile input file is valid', () => {
    importTypeFunc('User Profile');
    uploadFile('00-testProfiles.ndjson');
    // Wait between the click of the Ok button and the upload of the file so that the interface can catch up
    cy.wait(4000);
    cy.contains('Ok').click();
    cy.get('.mcs-importExecution_table').should('contain', 'RUNNING');
    cy.get('.mcs-importExecution_table').should('contain', 'SUCCEEDED');
  });

  it('should succeed if import activites input file is valid', () => {
    importTypeFunc('User Activity');
    uploadFile('01-testActivities.ndjson');
    // Wait between the click of the Ok button and the upload of the file so that the interface can catch up
    cy.wait(4000);
    cy.contains('Ok').click();
    cy.get('.mcs-importExecution_table').should('contain', 'RUNNING');
    cy.get('.mcs-importExecution_table').should('contain', 'SUCCEEDED');
  });

  it('should fail if import profile input file does not match user profile resource', () => {
    importTypeFunc('User Profile');
    uploadFile('02-wrongData.ndjson');
    // Wait between the click of the Ok button and the upload of the file so that the interface can catch up
    cy.wait(4000);
    cy.contains('Ok').click();
    cy.get('.ant-notification-notice-with-icon')
      .should('contain', 'Something went wrong')
      .should('be.visible');
  });
});
