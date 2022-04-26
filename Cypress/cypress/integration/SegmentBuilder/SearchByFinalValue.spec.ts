import faker from 'faker';

describe('This test should check that the search by final value feature is working properly', () => {
  //TODO delete the before method when search by final value is not feature flagged anymore
  before(() => {
    window.localStorage.setItem('features', '["audience-feature-search"]');
  });

  beforeEach(() => {
    cy.login();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
    });
  });

  afterEach(() => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      deleteAudienceFeatures(data.datamartName);
      deleteStandardSegmentBuilder(data.datamartName);
    });
    cy.clearLocalStorage();
  });

  const deleteAudienceFeatures = (datamartName: string) => {
    cy.get('.mcs-header_actions_settings').click();
    cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
    cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
    cy.contains(datamartName).click();
    cy.get('.mcs-tabs_tab--audienceFeatures').click();
    cy.get('.mcs-audienceFeatureTable_dropDownMenu')
      .should('be.visible')
      .each(() => {
        cy.get('.mcs-audienceFeatureTable_dropDownMenu')
          .first()
          .click()
          .then(() => {
            cy.get('.mcs-audienceFeatureTable_dropDownMenu--delete').click();
            cy.get('.mcs-audienceFeatureDeletePopUp').should('be.visible');
            cy.get('.mcs-audienceFeatureDeletePopUp_ok_button').click();
            // Wait deletion of audience features
            cy.wait(1000);
          });
      });
  };

  const deleteStandardSegmentBuilder = (datamartName: string) => {
    cy.get('.mcs-header_actions_settings').click();
    cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
    cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
    cy.contains(datamartName).click();
    cy.get('.mcs-tabs_tab--segmentBuilder').click();
    cy.get('.mcs-standardSegmentBuilderTable_dropDownMenu')
      .should('be.visible')
      .each(() => {
        cy.get('.mcs-standardSegmentBuilderTable_dropDownMenu')
          .first()
          .click()
          .then(() => {
            cy.get('.mcs-standardSegmentBuilderTable_dropDownMenu--delete').click();
            cy.get('.mcs-standardSegmentBuilderDeletePopUp').should('be.visible');
            cy.get('.mcs-standardSegmentBuilderDeletePopUp_delete_button').click();
            // Wait deletion of standard segment builder
            cy.wait(1000);
          });
      });
  };

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

  const createAudienceFeature = (
    datamartName: string,
    audienceFeatureName: string,
    audienceFeatureDescription: string,
    object_tree_expression: string,
  ) => {
    cy.get('.mcs-header_actions_settings').click();
    cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
    cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
    cy.contains(datamartName).click();
    cy.get('.mcs-tabs_tab--audienceFeatures').click();
    cy.get('.mcs-audienceFeature_creation_button').click();
    cy.get('.mcs-audienceFeatureName').type(audienceFeatureName);
    cy.get('.mcs-audienceFeatureDescription').type(audienceFeatureDescription);
    cy.get('.mcs-audienceFeature_edit_query_button').click();
    cy.get('.mcs-otqlInputEditor_otqlConsole > textarea').type(
      '{selectall}{backspace}{backspace}',
      {
        force: true,
      },
    );
    cy.get('.mcs-otqlInputEditor_otqlConsole > textarea').type(
      'select {id} from UserPoint where ' + object_tree_expression,
      {
        force: true,
        parseSpecialCharSequences: false,
      },
    );
    cy.get('.mcs-audienceFeature_update_query').click();
    cy.get('.mcs-form_saveButton_audienceFeatureForm').click();
    cy.get('.mcs-tabs_tab--audienceFeatures').click();
    cy.get('.mcs-audienceFeature_table')
      .should('contain', object_tree_expression)
      .and('contain', audienceFeatureName);
  };

  const importCSVFinalValues = (datamartId: string, accessToken: string, fileName: string) => {
    cy.fixture(fileName).then(csv => {
      cy.request({
        url: `${Cypress.env(
          'apiDomain',
        )}/v1/datamarts/${datamartId}/reference_table_job_executions`,
        method: 'POST',
        headers: {
          Authorization: accessToken,
          'Content-Type': 'text/csv',
        },
        body: csv,
      });
    });
  };

  it('Should trigger autocompletion after 3 characters and should not have doubloons of final values that have different path', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      //Import CSV file
      importCSVFinalValues(data.datamartId, data.accessToken, 'finalValues.csv');
      const standardSegmentBuilderName = faker.random.words(2);
      createStandardSegmentBuilder(data.datamartName, standardSegmentBuilderName);
      cy.get('.mcs-breadcrumb').should('be.visible');

      //Create audience feature 1
      const audienceFeatureName1 = 'Get audience by emails';
      const audienceFeatureDescription1 = 'Filter an audience with emails';
      const objectTreeExpression1 = 'emails {email == $email}';
      createAudienceFeature(
        data.datamartName,
        audienceFeatureName1,
        audienceFeatureDescription1,
        objectTreeExpression1,
      );

      //Create audience feature 2
      const audienceFeatureName2 = 'Get audience by page names';
      const audienceFeatureDescription2 = 'Filter an audience with page names';
      const objectTreeExpression2 = 'activity_events {page {page_name == $page_name} }';
      createAudienceFeature(
        data.datamartName,
        audienceFeatureName2,
        audienceFeatureDescription2,
        objectTreeExpression2,
      );

      //Create audience feature 3
      const audienceFeatureName3 = 'Get audience by countries';
      const audienceFeatureDescription3 = 'Filter an audience with countries';
      const objectTreeExpression3 = 'profiles {country == $country}';
      createAudienceFeature(
        data.datamartName,
        audienceFeatureName3,
        audienceFeatureDescription3,
        objectTreeExpression3,
      );

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
      cy.get('.mcs-standardSegmentBuilder_featureSelector--searchAudienceFeature').type('fr');
      cy.get('[title="france"]').should('not.exist');
      cy.get('.mcs-standardSegmentBuilder_featureSelector--searchAudienceFeature').type('a');
      cy.get('[title="france"]').should('exist').and('be.visible');
      cy.get('.mcs-standardSegmentBuilder_featureSelector--searchAudienceFeature').type('{enter}');
      cy.get('.mcs-standardSegmentBuilder_featureCard')
        .first()
        .find('.mcs-standardSegmentBuilder_featureCardFinalValue')
        .should('have.length', 5);
    });
    cy.get('.mcs-close').click();
  });
  it('Should have audience features appearing in the drawer after selecting final values', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      //Import CSV file
      importCSVFinalValues(data.datamartId, data.accessToken, 'finalValues.csv');
      const standardSegmentBuilderName = faker.random.words(2);
      createStandardSegmentBuilder(data.datamartName, standardSegmentBuilderName);
      cy.get('.mcs-breadcrumb').should('be.visible');

      //Create audience feature 1
      const audienceFeatureName1 = 'Get audience by emails';
      const audienceFeatureDescription1 = 'Filter an audience with emails';
      const objectTreeExpression1 = 'emails {email == $email}';
      createAudienceFeature(
        data.datamartName,
        audienceFeatureName1,
        audienceFeatureDescription1,
        objectTreeExpression1,
      );

      //Create audience feature 2
      const audienceFeatureName2 = 'Get audience by page names';
      const audienceFeatureDescription2 = 'Filter an audience with page names';
      const objectTreeExpression2 = 'activity_events {page {page_name == $page_name} }';
      createAudienceFeature(
        data.datamartName,
        audienceFeatureName2,
        audienceFeatureDescription2,
        objectTreeExpression2,
      );

      //Create audience feature 3
      const audienceFeatureName3 = 'Get audience by countries';
      const audienceFeatureDescription3 = 'Filter an audience with countries';
      const objectTreeExpression3 = 'profiles {country == $country}';
      createAudienceFeature(
        data.datamartName,
        audienceFeatureName3,
        audienceFeatureDescription3,
        objectTreeExpression3,
      );

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
      //Include audience feature
      cy.get('.mcs-timelineButton_left').click();
      cy.get('.mcs-standardSegmentBuilder_featureSelector--searchAudienceFeature').type(
        'fra{enter}',
      );
      cy.get('.mcs-standardSegmentBuilder_featureCard')
        .first()
        .within(() => {
          cy.contains('france').click();
          cy.contains('the new fragran').click();
          cy.contains('fragile is the').click();
          cy.contains('france-info is').click();
        });
      cy.get('.mcs-standardSegmentBuilder_featureCard')
        .last()
        .within(() => {
          cy.contains('france').click();
        });
      cy.get('.mcs-standardSegmentBuilder_tagsContainer').should('be.visible');
      cy.get('.mcs-standardSegmentBuilder_featureSelector--searchAudienceFeature').type(
        '{selectall}{backspace}me@med{enter}',
      );
      cy.get('.mcs-standardSegmentBuilder_featureCard').within(() => {
        cy.contains('me@media').click();
      });
      cy.get('.mcs-standardSegmentBuilder_AddFeatureButton').click();
      cy.get('.mcs-timeline_title').should('have.length', 3);

      cy.get('.mcs-timeline_title').eq(0).should('contain', 'People should match');
      cy.get('.mcs-timeline_group')
        .eq(0)
        .within(() => {
          cy.get('.mcs-standardSegmentBuilder_audienceFeatureContent')
            .should('contain', 'Get audience by emails')
            .find('.mcs-standardSegmentBuilder_audienceFeatureInput')
            .should('contain', 'me@mediarithmics.com');
        });
      cy.get('.mcs-timeline_title')
        .eq(1)
        .should('contain', 'AND')
        .and('contain', 'People should match');
      cy.get('.mcs-timeline_group')
        .eq(1)
        .within(() => {
          cy.get('.mcs-standardSegmentBuilder_audienceFeatureContent')
            .should('contain', 'Get audience by page names')
            .find('.mcs-standardSegmentBuilder_audienceFeatureInput')
            .should('contain', 'france-info is a radio that i have never listened to');
        });
      cy.get('.mcs-timeline_title')
        .eq(2)
        .should('contain', 'AND')
        .and('contain', 'People should match');
      cy.get('.mcs-timeline_group')
        .eq(2)
        .within(() => {
          cy.get('.mcs-standardSegmentBuilder_audienceFeatureContent')
            .should('contain', 'Get audience by countries')
            .find('.mcs-standardSegmentBuilder_audienceFeatureInput')
            .should('contain', 'france');
        });
      //Exclude audience features
      cy.get('.mcs-timelineButton_right').click();
      cy.get('.mcs-standardSegmentBuilder_featureSelector--searchAudienceFeature').type(
        'madagascar{enter}',
      );
      cy.get('.mcs-standardSegmentBuilder_featureCard')
        .first()
        .within(() => {
          cy.contains('maDagascar').click();
        });
      cy.get('.mcs-standardSegmentBuilder_AddFeatureButton').click();
      cy.get('.mcs-timeline_title').last().should('contain', 'Exclude people matching');
      cy.get('.mcs-timeline')
        .last()
        .within(() => {
          cy.get('.mcs-standardSegmentBuilder_audienceFeatureContent')
            .first()
            .find('.mcs-standardSegmentBuilder_audienceFeatureInput')
            .should('contain', 'maDagascar');
        });
      //Add one more exclusion
      cy.get('.mcs-timeline_actionDot').last().click();
      cy.get('.mcs-standardSegmentBuilder_featureSelector--searchAudienceFeature').type(
        'salut MarkyMarc{enter}',
      );
      cy.get('.mcs-standardSegmentBuilder_featureCard')
        .first()
        .within(() => {
          cy.contains('salut MarkyMarc').click();
        });
      cy.get('.mcs-standardSegmentBuilder_AddFeatureButton').click();
      cy.get('.mcs-timeline_title').last().should('contain', 'Exclude people matching');
      cy.get('.mcs-timeline')
        .last()
        .within(() => {
          cy.get('.mcs-standardSegmentBuilder_audienceFeatureContent')
            .last()
            .find('.mcs-standardSegmentBuilder_audienceFeatureInput')
            .should('contain', 'salut MarkyMarc');
        });
    });
  });
  it('Should test multiselecting final values inside an audience features that have a list in the object tree expression', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      //Import CSV file
      importCSVFinalValues(data.datamartId, data.accessToken, 'finalValues.csv');
      const standardSegmentBuilderName = faker.random.words(2);
      createStandardSegmentBuilder(data.datamartName, standardSegmentBuilderName);
      cy.get('.mcs-breadcrumb').should('be.visible');

      //Create audience features 1
      const audienceFeatureName1 = 'Get audience by page names';
      const audienceFeatureDescription1 = 'Filter an audience with page names';
      const objectTreeExpression1 = 'activity_events {page {page_name in $page_name} }';
      createAudienceFeature(
        data.datamartName,
        audienceFeatureName1,
        audienceFeatureDescription1,
        objectTreeExpression1,
      );
      // Create audience feature 2
      const audienceFeatureName2 = 'Get audience by countries';
      const audienceFeatureDescription2 = 'Filter an audience with countries';
      const objectTreeExpression2 = 'profiles {country == $country}';
      createAudienceFeature(
        data.datamartName,
        audienceFeatureName2,
        audienceFeatureDescription2,
        objectTreeExpression2,
      );
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
      cy.get('.mcs-standardSegmentBuilder_featureSelector--searchAudienceFeature').type(
        'fra{enter}',
      );
      cy.get('.mcs-standardSegmentBuilder_featureCard')
        .first()
        .within(() => {
          cy.contains('france').click();
          cy.contains('the new fragran').click();
          cy.contains('fragile is the').click();
          cy.contains('france-info is').click();
        });
      cy.get('.mcs-standardSegmentBuilder_AddFeatureButton').click();
      cy.get('.mcs-timeline_group').first().should('contain', 'People should match');
      cy.get('.mcs-standardSegmentBuilder_audienceFeatureInput')
        .first()
        .should('contain', 'france')
        .and('contain', 'the new fragrance by diesel is facing major backlash')
        .and('contain', 'fragile is the opposite of robust and must be taken care of')
        .and('contain', 'france-info is a radio that i have never listened to');
      cy.get('.mcs-timelineButton_left').click();
      cy.get('.mcs-standardSegmentBuilder_featureSelector--searchAudienceFeature').type(
        'mad{enter}',
      );
      cy.get('.mcs-standardSegmentBuilder_featureCard')
        .first()
        .within(() => {
          cy.contains('Madona').click();
        });
      cy.get('.mcs-standardSegmentBuilder_featureCard')
        .last()
        .within(() => {
          cy.contains('maDagascar').click();
        });
      cy.get('.mcs-standardSegmentBuilder_tagsContainer')
        .should('be.visible')
        .and('contain', 'maDa');
      cy.get('.mcs-standardSegmentBuilder_tagsContainer')
        .should('be.visible')
        .children()
        .last()
        .children()
        .first()
        .should('be.visible')
        .click();
      cy.get('.mcs-standardSegmentBuilder_AddFeatureButton').click();
      cy.get('.mcs-timeline_title')
        .last()
        .should('contain', 'AND')
        .and('contain', 'People should match');
      cy.get('.mcs-standardSegmentBuilder_audienceFeature')
        .last()
        .should('not.contain', 'Get audience countries')
        .and('contain', 'Get audience by page names')
        .find('.mcs-standardSegmentBuilder_audienceFeatureInput')
        .should('contain', 'Madona');
    });
  });
  it('Should remove the tag after deselecting a final value or the audience feature name in the audience feature drawer', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      //Import CSV file
      importCSVFinalValues(data.datamartId, data.accessToken, 'finalValues.csv');
      const standardSegmentBuilderName = faker.random.words(2);
      createStandardSegmentBuilder(data.datamartName, standardSegmentBuilderName);
      cy.get('.mcs-breadcrumb').should('be.visible');

      //Create audience feature
      const audienceFeatureName = 'Get audience by page names';
      const audienceFeatureDescription = 'Filter an audience with page names';
      const objectTreeExpression = 'activity_events {page {page_name in $page_name} }';
      createAudienceFeature(
        data.datamartName,
        audienceFeatureName,
        audienceFeatureDescription,
        objectTreeExpression,
      );
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
      cy.get('.mcs-standardSegmentBuilder_featureSelector--searchAudienceFeature').type(
        'Madona{enter}',
      );
      // Select the final value
      cy.get('.mcs-standardSegmentBuilder_featureCard')
        .first()
        .within(() => {
          cy.contains('Madona').click();
        });
      // The tag container should appear
      cy.get('.mcs-standardSegmentBuilder_tagsContainer').should('be.visible');
      //Deselect the final value
      cy.get('.mcs-standardSegmentBuilder_featureCard')
        .first()
        .within(() => {
          cy.contains('Madona').click();
        });
      // The tag container should disappear
      cy.get('.mcs-standardSegmentBuilder_tagsContainer').should('not.be.visible');
      // Select the audience feature
      cy.get('.mcs-standardSegmentBuilder_featureCard')
        .first()
        .within(() => {
          cy.contains(audienceFeatureName).click();
        });
      // The tag container should appear
      cy.get('.mcs-standardSegmentBuilder_tagsContainer').should('be.visible');
      //Deselect the audience feature
      cy.get('.mcs-standardSegmentBuilder_featureCard')
        .first()
        .within(() => {
          cy.contains(audienceFeatureName).click();
        });
      // The tag container should disappear
      cy.get('.mcs-standardSegmentBuilder_tagsContainer').should('not.be.visible');
      cy.get('.mcs-close').click();
    });
  });
  it('Should have the more button appearing in an audience feature card when we have more than 5 final values for an audience feature', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      //Import CSV file
      importCSVFinalValues(data.datamartId, data.accessToken, 'finalValues.csv');
      const standardSegmentBuilderName = faker.random.words(2);
      createStandardSegmentBuilder(data.datamartName, standardSegmentBuilderName);
      cy.get('.mcs-breadcrumb').should('be.visible');

      //Create audience feature
      const audienceFeatureName = 'Get audience by page names';
      const audienceFeatureDescription = 'Filter an audience with page names';
      const objectTreeExpression = 'activity_events {page {page_name in $page_name} }';
      createAudienceFeature(
        data.datamartName,
        audienceFeatureName,
        audienceFeatureDescription,
        objectTreeExpression,
      );
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
      cy.get('.mcs-standardSegmentBuilder_featureSelector--searchAudienceFeature').type(
        'fra{enter}',
      );
      cy.get('.mcs-standardSegmentBuilder_featureCardMore').click();
      cy.get('.mcs-standardSegmentBuilder_finalValuesMenu').within(() => {
        cy.get('.mcs-standardSegmentBuilder_featureCardFinalValue').first().click();
        cy.get('.mcs-standardSegmentBuilder_featureCardFinalValue').last().click();
      });
      cy.get('.mcs-standardSegmentBuilder_tagsContainer').should('be.visible');
      cy.get('.mcs-standardSegmentBuilder_AddFeatureButton').click();
      cy.get('.mcs-standardSegmentBuilder_audienceFeatureContent')
        .should('contain', audienceFeatureName)
        .find('.mcs-standardSegmentBuilder_audienceFeatureInput')
        .should('contain', 'franchement ce test est beaucoup trop long')
        .and('contain', 'franchise peut avoir deux définitions différentes selon le contexte');
    });
  });
});
