import SegmentsPage from '../../../../pageobjects/Audience/SegmentsPage';
import ProcessingActivitiesPage from '../../../../pageobjects/Settings/Organisation/ProcessingActivitiesPage';
describe('This test should check that the audience segments forms are working properly', () => {
  beforeEach(() => {
    cy.login();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
    });
  });

  const processingActivitiesPage = new ProcessingActivitiesPage();

  const processingActivitiesTypes = [
    'Consent',
    'Contractual performance',
    'Legal obligation',
    'Public interest or exercise of official authority',
    'Legitimate interest',
  ];

  const deleteSegment = () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.goToHome(data.organisationId);
    });
    const segmentsPage = new SegmentsPage();
    segmentsPage.goToPage();
    segmentsPage.searchBar.type('Test Audience Segment Form{enter}').then(() => {
      cy.wait(5000);
      segmentsPage.dropDownMenu.should('be.visible').each(dropdownArrow => {
        cy.wrap(dropdownArrow)
          .click()
          .then(() => {
            //Wait between deletions
            cy.wait(1000);
            segmentsPage.clickBtnDelete();
            segmentsPage.deletePopUp.should(
              'contain',
              'You are about to definitively delete this segment : Test Audience Segment Form',
            );
            segmentsPage.clickBtnOkDeletePopUp();
          });
      });
      segmentsPage.segmentsTable.should('not.contain', 'Test Audience Segment Form');
    });
  };

  const createProcessingActivities = (
    type: string,
    name: string,
    purpose: string,
    technicalName: string,
  ) => {
    processingActivitiesPage.goToPage();
    processingActivitiesPage.clickBtnNewDataProcessing();
    cy.get('.mcs-menu-list-content-title').each(title => {
      if (title.text() == type) {
        cy.wrap(title).click();
        return false;
      }
    });
    processingActivitiesPage.typeProcessingActivitiesName(name);
    processingActivitiesPage.typeProcessingActivitiesPurpose(purpose);
    processingActivitiesPage.clickBtnAdvancedInformation();
    processingActivitiesPage.typeProcessingActivitiesTechnicalName(technicalName);
    cy.intercept('**/processings?**').as('processingTable');
    processingActivitiesPage.clickBtnSaveProcessing();
    cy.wait('@processingTable');
    processingActivitiesPage.namesColumn.should('contain', name);
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.goToHome(data.organisationId);
    });
  };

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should create and delete User List Segment', () => {
    const processingActivitiesPage = new ProcessingActivitiesPage();
    const randomProcessingActivitiesType =
      processingActivitiesTypes[Math.floor(Math.random() * processingActivitiesTypes.length)];
    createProcessingActivities(
      randomProcessingActivitiesType,
      processingActivitiesPage.name,
      processingActivitiesPage.purpose,
      processingActivitiesPage.technicalName,
    );
    const segmentsPage = new SegmentsPage();
    segmentsPage.goToPage();
    cy.createSegmentFromUI('User List', processingActivitiesPage.name);
    deleteSegment();
  });

  it('should create and delete user pixel segment', () => {
    const processingActivitiesPage = new ProcessingActivitiesPage();
    const randomProcessingActivitiesType =
      processingActivitiesTypes[Math.floor(Math.random() * processingActivitiesTypes.length)];
    createProcessingActivities(
      randomProcessingActivitiesType,
      processingActivitiesPage.name,
      processingActivitiesPage.purpose,
      processingActivitiesPage.technicalName,
    );
    const segmentsPage = new SegmentsPage();
    segmentsPage.goToPage();
    cy.createSegmentFromUI('User Pixel', processingActivitiesPage.name);
    deleteSegment();
  });

  it('should create user expert query segment', () => {
    const processingActivitiesPage = new ProcessingActivitiesPage();
    const randomProcessingActivitiesType =
      processingActivitiesTypes[Math.floor(Math.random() * processingActivitiesTypes.length)];
    createProcessingActivities(
      randomProcessingActivitiesType,
      processingActivitiesPage.name,
      processingActivitiesPage.purpose,
      processingActivitiesPage.technicalName,
    );
    const segmentsPage = new SegmentsPage();
    segmentsPage.goToPage();
    cy.createSegmentFromUI('User Expert Query', processingActivitiesPage.name);
    deleteSegment();
  });
});
