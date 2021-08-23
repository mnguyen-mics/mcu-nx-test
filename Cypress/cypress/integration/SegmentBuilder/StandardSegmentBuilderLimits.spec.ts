import faker from 'faker';

describe('This test should check the creation limit of standard segment builders and audience features folders', () => {
  beforeEach(() => {
    cy.login();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
    });
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  const createStandardSegmentBuilder = (
    datamartName: string,
    standardSegmentBuilderName: string,
  ) => {
    cy.get('.mcs-navigator-header-actions-settings').click();
    cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
    cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
    cy.contains(datamartName).click();
    cy.get('.mcs-tabs_tab--segmentBuilder').click();
    cy.get('.mcs-standardSegmentBuilder_creation_button').click();
    cy.get('.mcs-standardSegmentBuilderName').type(standardSegmentBuilderName);
    cy.get('.mcs-form_saveButton_standardSegmentBuilderForm').click();
  };

  it('Should test the creation limit of 20 segment builders', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      let standardSegmentBuilder = '';
      for (let index = 0; index < 20; index++) {
        standardSegmentBuilder = faker.random.words(2);
        createStandardSegmentBuilder(data.datamartName, standardSegmentBuilder);
        cy.wait(2000);
      }
      createStandardSegmentBuilder(data.datamartName, standardSegmentBuilder);
      cy.get('.mcs-notifications_errorDescription')
        .should('be.visible')
        .and('contain', 'The limit of 20 authorized audience builders has been reached');
    });
  });

  it('Should test the creation limit of 100 audience features folders', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      let audienceFeaturesFolderName = '';
      cy.get('.mcs-navigator-header-actions-settings').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
      cy.contains(data.datamartName).click();
      cy.get('.mcs-tabs_tab--audienceFeatures').click();
      for (let index = 0; index < 100; index++) {
        audienceFeaturesFolderName = faker.random.word();
        cy.get('.mcs-audienceFeatureSettings-addFolderButton').click();
        cy.get('.mcs-audienceFeatureSettings-folderInput').type(audienceFeaturesFolderName);
        cy.get('.mcs-audienceFeatureSettings_addButton--addAudienceFeatureFolder').click();
        cy.wait(1500);
      }
      audienceFeaturesFolderName = faker.random.word();
      cy.get('.mcs-audienceFeatureSettings-addFolderButton').click();
      cy.get('.mcs-audienceFeatureSettings-folderInput').type(audienceFeaturesFolderName);
      cy.get('.mcs-audienceFeatureSettings_addButton--addAudienceFeatureFolder').click();

      cy.get('.mcs-notifications_errorDescription')
        .should('be.visible')
        .and('contain', 'Maximum authorized number of folders reached');
    });
  });
});
