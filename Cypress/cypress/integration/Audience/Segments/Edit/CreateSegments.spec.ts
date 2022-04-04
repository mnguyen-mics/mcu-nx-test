import faker from 'faker';

describe('This test should check that the audience segments forms are working properly', () => {
  beforeEach(() => {
    cy.login();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
    });
  });
  const processingActivitesTypes = [
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
    cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
    cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.segments').click();
    cy.get('.mcs-audienceSegmentsTable_search_bar')
      .type('Test Audience Segment Form{enter}')
      .then(() => {
        //Wait 5 seconds after typing enter to prevent dead DOM elements
        cy.wait(5000);
        cy.get('.mcs-audienceSegmentTable_dropDownMenu')
          .should('be.visible')
          .each(dropdownArrow => {
            cy.wrap(dropdownArrow)
              .click()
              .then(() => {
                //Wait between deletions
                cy.wait(1000);
                cy.get('.mcs-audienceSegmentTable_dropDownMenu--delete').click();
                cy.get('.mcs-audienceSegmentDeletePopup').should(
                  'contain',
                  'You are about to definitively delete this segment : Test Audience Segment Form',
                );
                cy.get('.mcs-audienceSegmentDeletePopup_ok_button').click();
              });
          });
        cy.get('.mcs-audienceSegmentTable').should('not.contain', 'Test Audience Segment Form');
      });
  };

  const createProcessingActivities = (
    type: string,
    processingName: string,
    processingPurpose: string,
    processingTechnicalName: string,
  ) => {
    cy.get('.mcs-header_actions_settings').click();
    cy.get('.mcs-settingsMainMenu_menu\\.organisation\\.title').click();
    cy.get('.mcs-settingsSideMenu_menu\\.organisation\\.processings').click();
    cy.contains('New Data Processing').click();
    cy.get('.mcs-menu-list-content-title').each(title => {
      if (title.text() == type) {
        cy.wrap(title).click();
        return false;
      }
    });
    cy.get('.mcs-processingActivities_nameField').type(processingName);
    cy.get('.mcs-processingActivities_purposeField').type(processingPurpose);
    cy.get('.mcs-settings').click();
    cy.get('.mcs-processingActivities_technicalNameField').type(processingTechnicalName);
    cy.get('.mcs-form_saveButton_processingForm').click();
    cy.get('.mcs-processingsList_processingTable').should('contain', processingName);
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.goToHome(data.organisationId);
    });
  };

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should create and delete User List Segment', () => {
    const randomProcessingActivitiesType =
      processingActivitesTypes[Math.floor(Math.random() * processingActivitesTypes.length)];
    const processingName = faker.random.word();
    const processingPurpose = faker.random.word();
    const processingTechnicalName = faker.random.word();
    createProcessingActivities(
      randomProcessingActivitiesType,
      processingName,
      processingPurpose,
      processingTechnicalName,
    );

    cy.contains('Audience').click();
    cy.contains('Segments').click();
    cy.createSegmentFromUI('User List', processingName);
    deleteSegment();
  });

  it('should create and delete user pixel segment', () => {
    const randomProcessingActivitiesType =
      processingActivitesTypes[Math.floor(Math.random() * processingActivitesTypes.length)];
    const processingName = faker.random.word();
    const processingPurpose = faker.random.word();
    const processingTechnicalName = faker.random.word();
    createProcessingActivities(
      randomProcessingActivitiesType,
      processingName,
      processingPurpose,
      processingTechnicalName,
    );
    cy.contains('Audience').click();
    cy.contains('Segments').click({ force: true });
    cy.createSegmentFromUI('User Pixel', processingName);
    deleteSegment();
  });

  it('should create user expert query segment', () => {
    const randomProcessingActivitiesType =
      processingActivitesTypes[Math.floor(Math.random() * processingActivitesTypes.length)];
    const processingName = faker.random.word();
    const processingPurpose = faker.random.word();
    const processingTechnicalName = faker.random.word();
    createProcessingActivities(
      randomProcessingActivitiesType,
      processingName,
      processingPurpose,
      processingTechnicalName,
    );
    cy.contains('Audience').click();
    cy.contains('Segments').click({ force: true });
    cy.createSegmentFromUI('User Expert Query', processingName);
    deleteSegment();
  });
});
