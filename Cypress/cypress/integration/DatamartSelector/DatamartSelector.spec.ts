import faker from 'faker';
import LeftMenu from '../../pageobjects/LeftMenu';

describe('Should test the datamart selector', () => {
  const datamartName = faker.random.word();
  before(() => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.createDatamart(data.accessToken, data.organisationId, datamartName);
    });
  });
  beforeEach(() => {
    cy.login();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
    });
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  const checkDatamartSelector = (datamartName1: string, datamartName2: string) => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-content-container')
        .should('contain', 'Datamarts')
        .and('contain', 'Choose your datamart');
      cy.get('.mcs-selector_container')
        .should('contain', datamartName)
        .and('contain', data.datamartName);
    });
  };

  it('Should have datamartSelector on audience home page', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      LeftMenu.goToHomePage();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cy.get('.mcs-content-container').should('be.visible');
    });
  });

  it('Should have datamartSelector on AudienceBuilder page', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.builder').click();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cy.get('.mcs-segmentBuilderSelector_container').should('be.visible');
    });
  });

  it('Should have datamartSelector on funnel page', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.dataStudio\\.funnel').click();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cy.get('.mcs-funnelQueryBuilder').should('be.visible');
    });
  });

  it('Should have datamartSelector on QueryTool page', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.dataStudio\\.query').click();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cy.get('.mcs-OTQLConsoleContainer_tabs').should('be.visible');
    });
  });

  it('Should have datamartSelector on ImportEditPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.library\\.Imports').click();
      cy.get('.mcs-imports_creationButton').click();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cy.get('.mcs-form_saveButton_importForm').should('be.visible');
    });
  });

  it('Should have datamartSelector on ExportEditPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-sideBar-subMenu_menu\\.dataStudio\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.library\\.Exports').click();
      cy.get('.mcs-exports_creationButton').click();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cy.get('.mcs-form_saveButton_exportForm').should('be.visible');
    });
  });

  it('Should have datamartSelector on AutomationBuilderPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-sideBar-subMenu_menu\\.automation\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.automation\\.builder').click();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cy.get('.mcs-automationTemplateSelector').should('be.visible');
    });
  });

  it('Should have datamartSelector on AdvancedSegmentBuilderPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.visit(`/#/v2/o/${data.organisationId}/audience/segment-builder/advanced`);
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cy.get('.mcs-saveQueryAsActionBar_button').should('be.visible');
    });
  });

  it('Should have datamartSelector on Monitoring page', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.monitoring').click();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cy.get('.mcs-montioringActionBar_userLookupButton').should('be.visible');
    });
  });

  it('Should have datamartSelector on EditAudienceSegmentPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.segments').click();
      cy.get('.mcs-segmentsActionBar_createNewSemgmentButton').click();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cy.get('.mcs-segmentTypeSelector').should('be.visible');
    });
  });

  it('Should have datamartSelector on GoalFormContainer', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-sideBar-subMenu_menu\\.campaign\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.campaign\\.goals').click();
      cy.get('.mcs-goalsActionBar_newGoalsButton').click();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cy.get('.mcs-goalTriggerTypeSelector').should('be.visible');
    });
  });

  it('Should have datamartSelector on CleaningRuleEditPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-header_actions_settings').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.cleaningRules').click();
      cy.get('.mcs-cleaningRules_creation_button').click();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cy.get('.mcs-form_saveButton_cleaningRuleForm').should('be.visible');
      cy.get('.mcs-cleaningRuleEditPage_breadcrumbLink').click();
      cy.get('.mcs-cleaningRulesDashboardPage_userProfileCleaningRuleTab').click();
      cy.get('.mcs-cleaningRules_creation_button').last().click();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cy.get('.mcs-form_saveButton_cleaningRuleForm').should('be.visible');
    });
  });

  it('Should have datamartSelector on CompartmentEditPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-header_actions_settings').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.compartments').click();
      cy.get('.mcs-compartmentsListPage_newCompartmentButton').click();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cy.get('.mcs-form_saveButton_compartmentForm').should('be.visible');
    });
  });

  it('Should have datamartSelector on DatamartReplicationEditPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.visit(`/#/v2/o/${data.organisationId}/settings/datamart/datamart_replication/create`);
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cy.get('.mcs-datamartReplicationEditForm_formContainer').should('be.visible');
    });
  });

  it('Should have datamartSelector on AudiencePartitionPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-header_actions_settings').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.partitions').click();
      cy.get('.mcs-audiencePartitionsActionBar_newAudiencePartitionsButton').click();
      cy.get('.mcs-audiencePartitionsActionBar_newRandomSplitButton').click();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cy.get('.mcs-form_saveButton_partitionForm').should('be.visible');
    });
  });

  it('Should have datamartSelector on EditMlFunctionPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-header_actions_settings').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.ml_functions').click();
      cy.get('.mcs-mlFunctionsContent_newMlFunctionsButton').click();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cy.get('.mcs-content-container').should('contain', 'New Ml Function');
    });
  });

  it('Should have datamartSelector on MobileApplicationEditPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-header_actions_settings').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.channels').click();
      cy.get('.mcs-channelListPage_newChannelButton').click();
      cy.get('.mcs-channelsListPage_NewMobileApplicationButton').click();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cy.get('.mcs-form_saveButton_mobileApplicationForm').should('be.visible');
    });
  });

  it('Should have datamartSelector on SiteEditPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-header_actions_settings').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.channels').click();
      cy.get('.mcs-channelListPage_newChannelButton').click();
      cy.get('.mcs-channelsListPage_NewSiteButton').click();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cy.get('.mcs-form_saveButton_siteForm').should('be.visible');
    });
  });
});
