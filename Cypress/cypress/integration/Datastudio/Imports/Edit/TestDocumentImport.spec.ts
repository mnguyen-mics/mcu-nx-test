import ImportsPage from '../../../../pageobjects/DataStudio/ImportsPage';

describe('User Profile Import Test', () => {
  const loginAndInitiateDocImportCreation = () => {
    cy.login();
    cy.url().should('contain', Cypress.config().baseUrl + '/#/v2/o/1/campaigns/display');
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const importsPage = new ImportsPage();
      const importName = `Test Import Activities ${Math.random().toString(36).substring(2, 10)}`;
      cy.switchOrg(data.organisationName);
      importsPage.goToPage();
      importsPage.clickBtnImportsCreation();
      cy.contains(data.datamartName).click();
      importsPage.importsInformation.typeImportName(importName);
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
  const importTypeFunc = (importType: string | number | RegExp, priorityLevel: string) => {
    const importsPage = new ImportsPage();
    importsPage.importsInformation.selectImportType(importType);
    importsPage.importsInformation.selectPriority(priorityLevel);
    importsPage.importsInformation.clickBtnSaveImport();
    importsPage.clickBtnNewExecution();
  };

  it('should succeed if import profile input file is valid', () => {
    const importsPage = new ImportsPage();
    importTypeFunc('User Profile', 'MEDIUM');
    uploadFile('00-testProfiles.ndjson');
    // Wait between the click of the Ok button and the upload of the file so that the interface can catch up
    cy.wait(4000);
    importsPage.clickOK();
    importsPage.importExecutionTable.should('contain', 'RUNNING');
    importsPage.importExecutionTable.should('contain', 'SUCCEEDED');
  });

  it('should succeed if import activites input file is valid', () => {
    const importsPage = new ImportsPage();
    importTypeFunc('User Activity', 'MEDIUM');
    uploadFile('01-testActivities.ndjson');
    // Wait between the click of the Ok button and the upload of the file so that the interface can catch up
    cy.wait(4000);
    importsPage.clickOK();
    importsPage.importExecutionTable.should('contain', 'RUNNING');
    importsPage.importExecutionTable.should('contain', 'SUCCEEDED');
  });

  it('should fail if import profile input file does not match user profile resource', () => {
    const importsPage = new ImportsPage();
    importTypeFunc('User Profile', 'MEDIUM');
    uploadFile('02-wrongData.ndjson');
    // Wait between the click of the Ok button and the upload of the file so that the interface can catch up
    cy.wait(4000);
    importsPage.clickOK();
    importsPage.notificationNotice.should('contain', 'Something went wrong').should('be.visible');
  });
});
