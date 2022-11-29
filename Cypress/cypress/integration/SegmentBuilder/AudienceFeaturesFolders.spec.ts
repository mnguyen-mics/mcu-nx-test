import faker from 'faker';

describe('This test should check that the audience feature folders work properly', () => {
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
    cy.get('.mcs-header_actions_settings').click();
    cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
    cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
    cy.contains(datamartName).click();
    cy.get('.mcs-tabs_tab--segmentBuilder').click();
    cy.get('.mcs-standardSegmentBuilder_creation_button').click();
    cy.get('.mcs-standardSegmentBuilderName').type(standardSegmentBuilderName);
    cy.get('.mcs-form_saveButton_standardSegmentBuilderForm').click();
  };

  const createAudienceFeaturesFolder = (
    datamartName: string,
    audienceFeaturesFolderName: string,
  ) => {
    cy.get('.mcs-header_actions_settings').click();
    cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
    cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
    cy.contains(datamartName).click();
    cy.get('.mcs-tabs_tab--audienceFeatures').click();
    cy.get('.mcs-audienceFeatureSettings-addFolderButton').click();
    cy.get('.mcs-audienceFeatureSettings-folderInput').type(audienceFeaturesFolderName);
    cy.get('.mcs-audienceFeatureSettings_addButton--addAudienceFeatureFolder').click();
  };

  it('Should have a pop up message when trying to delete a folder that contains auidence features', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const standardSegmentBuilderName = faker.random.words(2);
      const audienceFeatureName = faker.random.words(2);
      createStandardSegmentBuilder(data.datamartName, standardSegmentBuilderName);
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/audience_features`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          name: audienceFeatureName,
          description: 'Test - Standard Segment Builder - Cypress',
          object_tree_expression: 'creation_ts > $date',
          addressable_object: 'UserPoint',
        },
      }).then(() => {
        cy.goToHome(data.organisationId);
        const audienceFeaturesFolderName = faker.random.word();
        createAudienceFeaturesFolder(data.datamartName, audienceFeaturesFolderName);
        cy.wait(1000);
        cy.get('.mcs-audienceFeatureTable_dropDownMenu').last().click();
        cy.get('.mcs-audienceFeatureTable_dropDownMenu--edit').click();
        cy.get('.mcs-audienceFeatureFolder').click();
        cy.contains(audienceFeaturesFolderName).click();
        cy.get('.mcs-form_saveButton_audienceFeatureForm').click();
        cy.get('.mcs-audienceFeatureFolder_dropDownMenu').click();
        cy.get('.mcs-audienceFeatureFolder_dropDownMenu--delete').click();
        cy.get('.mcs-modal--errorDialog')
          .should('be.visible')
          .and('contain', 'You cannot delete a folder when there are audience features inside');
        cy.get('.mcs-audienceFeatureFolderErrorDeletePopUp_ok_button').click();
        cy.get('.mcs-audienceFeatureSettings_folder').should('have.length', 1);
      });
    });
  });

  it('Should delete an empty folder', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const audienceFeaturesFolderName = faker.random.word();
      createAudienceFeaturesFolder(data.datamartName, audienceFeaturesFolderName);
      cy.contains(audienceFeaturesFolderName).should('be.visible');
      cy.contains(audienceFeaturesFolderName)
        .parent()
        .parent()
        .find('.mcs-audienceFeatureFolder_dropDownMenu')
        .click();
      cy.get('.mcs-audienceFeatureFolder_dropDownMenu--delete').click();
      cy.get('.mcs-audienceFeatureFolderDeletePopUp_ok_button').click();
      cy.get('.mcs-audienceFeatureSettings_folderTable').should(
        'not.contain',
        audienceFeaturesFolderName,
      );
    });
  });

  it('Should rename a folder', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const audienceFeaturesFolderName = faker.random.word();
      createAudienceFeaturesFolder(data.datamartName, audienceFeaturesFolderName);
      cy.contains(audienceFeaturesFolderName).should('be.visible');
      cy.contains(audienceFeaturesFolderName)
        .parent()
        .parent()
        .find('.mcs-audienceFeatureFolder_dropDownMenu')
        .click();
      cy.get('.mcs-audienceFeatureFolder_dropDownMenu--rename').click();
      const audienceFeaturesFolderRenamed = faker.random.word();
      cy.get('.mcs-audienceFeatureSettings-folderInput').type(
        '{selectall}{backspace}' + audienceFeaturesFolderRenamed,
      );
      cy.get('.mcs-audienceFeatureSettings_renameButton--renameAudienceFeatureFolder').click();
      //Wait for the folder to be renamed
      cy.wait(4000);
      cy.get('.mcs-audienceFeatureSettings_folderTable').should(
        'not.contain',
        audienceFeaturesFolderName,
      );
      cy.get('.mcs-audienceFeatureSettings_folderTable').should(
        'contain',
        audienceFeaturesFolderRenamed,
      );
    });
  });

  it('should be able to select an audience feature in an audience feature folder inside the standard segment builder drawer', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const standardSegmentBuilderName = faker.random.words(2);
      const audienceFeatureName = faker.random.words(2);
      createStandardSegmentBuilder(data.datamartName, standardSegmentBuilderName);
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/audience_features`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          name: audienceFeatureName,
          description: 'Test',
          object_tree_expression: 'creation_ts = $date',
          addressable_object: 'UserPoint',
        },
      }).then(() => {
        const audienceFeaturesFolderName = faker.random.word();
        createAudienceFeaturesFolder(data.datamartName, audienceFeaturesFolderName);
        cy.wait(1000);
        cy.get('.mcs-audienceFeatureTable_dropDownMenu').last().click();
        cy.get('.mcs-audienceFeatureTable_dropDownMenu--edit').click();
        cy.get('.mcs-audienceFeatureFolder').click();
        cy.get('.mcs-audienceFeatureFolder').within(() => {
          cy.contains(audienceFeaturesFolderName).click();
        });
        cy.get('.mcs-form_saveButton_audienceFeatureForm').click();
        cy.wait(1000);
        cy.goToHome(data.organisationId);
        cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
        cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.builder').click();
        cy.wait(3000);
        cy.url().then(url => {
          if (url.match(/.*segment-builder-selector$/g)) {
            cy.get('.mcs-standardSegmentBuilder_dropdownContainer').trigger('mouseover');
            // Wait for the dropdown to appear
            cy.wait(3000);
            cy.get('.mcs-standardSegmentBuilder_dropdownContainer').then($element => {
              if ($element.find('.mcs-menu-list').length > 0) {
                cy.contains(standardSegmentBuilderName).click();
              } else {
                cy.get('.mcs-standardSegmentBuilder_dropdownContainer').click();
              }
            });
          }
        });
        cy.get('.mcs-timelineButton_left').click();
        cy.contains(audienceFeaturesFolderName).click();
        cy.contains(audienceFeatureName).click();
        cy.get('.mcs-standardSegmentBuilder_AddFeatureButton').click();
        cy.get('.mcs-standardSegmentBuilder_audienceFeature')
          .should('be.visible')
          .within(() => {
            cy.get('.mcs-standardSegmentBuilder_audienceFeatureName').should(
              'contain',
              audienceFeatureName,
            );
            cy.get('.mcs-standardSegmentBuilder_audienceFeatureDescription').should(
              'contain',
              'Test',
            );
          });
      });
    });
  });
});
