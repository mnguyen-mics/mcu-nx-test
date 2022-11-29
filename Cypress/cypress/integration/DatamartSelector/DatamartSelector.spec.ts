import faker from 'faker';
import LeftMenu from '../../pageobjects/LeftMenu';
import ChannelsPage from '../../pageobjects/Settings/Datamart/Channels/ChannelsPage';
import MlFunctionsPage from '../../pageobjects/Settings/Datamart/MlFunctionsPage';
import PartitionsPage from '../../pageobjects/Settings/Datamart/PartitionsPage';
import CompartmentsPage from '../../pageobjects/Settings/Datamart/CompartmentsPage';
import CleaningRulesPage from '../../pageobjects/Settings/Datamart/CleaningRulesPage';
import BuildersPage from '../../pageobjects/Audience/BuildersPage';
import FunnelPage from '../../pageobjects/DataStudio/FunnelPage';
import QueryToolPage from '../../pageobjects/DataStudio/QueryTool/QueryToolPage';
import ImportsPage from '../../pageobjects/DataStudio/ImportsPage';
import ExportsPage from '../../pageobjects/DataStudio/ExportsPage';
import BuilderPage from '../../pageobjects/Automations/BuilderPage';
import MonitoringPage from '../../pageobjects/Audience/MonitoringPage';
import SegmentsPage from '../../pageobjects/Audience/SegmentsPage';
import GoalsPage from '../../pageobjects/Campaigns/GoalsPage';
import DatamartsPage from '../../pageobjects/Settings/Datamart/DatamartsPage';

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
      const datamrtsPage = new DatamartsPage();
      datamrtsPage.datamartsContent
        .should('contain', 'Datamarts')
        .and('contain', 'Choose your datamart');
      datamrtsPage.datamartsSelector
        .should('contain', datamartName)
        .and('contain', data.datamartName);
    });
  };

  it('Should have datamartSelector on audience home page', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const datamrtsPage = new DatamartsPage();
      LeftMenu.goToHomePage();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      datamrtsPage.datamartsContent.should('be.visible');
    });
  });

  it('Should have datamartSelector on AudienceBuilder page', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const buildersPage = new BuildersPage();
      buildersPage.goToPage();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      buildersPage.buildersPage.should('be.visible');
    });
  });

  it('Should have datamartSelector on funnel page', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const funnelPage = new FunnelPage();
      funnelPage.goToPage();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      funnelPage.funnelAnalyticsPage.should('be.visible');
    });
  });

  it('Should have datamartSelector on QueryTool page', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const queryToolPage = new QueryToolPage();
      queryToolPage.goToPage();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      queryToolPage.consoleContainer.should('be.visible');
    });
  });

  it('Should have datamartSelector on ImportEditPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const importsPage = new ImportsPage();
      importsPage.goToPage();
      importsPage.clickBtnImportsCreation();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      importsPage.importsInformation.btnSaveImport.should('be.visible');
    });
  });

  it('Should have datamartSelector on ExportEditPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const exportPage = new ExportsPage();
      exportPage.goToPage();
      exportPage.clickBtnExportsCreation();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      exportPage.exportsInformation.btnSaveExport.should('be.visible');
    });
  });

  it('Should have datamartSelector on AutomationBuilderPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const builderPage = new BuilderPage();
      builderPage.goToPage();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      builderPage.automationTypeSelector.should('be.visible');
    });
  });

  it('Should have datamartSelector on AdvancedSegmentBuilderPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const segmentsPage = new SegmentsPage();
      cy.visit(`/#/v2/o/${data.organisationId}/audience/segment-builder/advanced`);
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      segmentsPage.btnSave.should('be.visible');
    });
  });

  it('Should have datamartSelector on Monitoring page', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const monitoringPage = new MonitoringPage();
      monitoringPage.goToPage();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      monitoringPage.btnUserLookup.should('be.visible');
    });
  });

  it('Should have datamartSelector on EditAudienceSegmentPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const segmentsPage = new SegmentsPage();
      segmentsPage.goToPage();
      segmentsPage.clickBtnNewSegment();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      segmentsPage.segmentTypeSelector.should('be.visible');
    });
  });

  it('Should have datamartSelector on GoalFormContainer', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const goalsPage = new GoalsPage();
      goalsPage.goToPage();
      goalsPage.clickBtnNewGoals();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      goalsPage.goalTypeSelector.should('be.visible');
    });
  });

  it('Should have datamartSelector on CleaningRuleEditPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const cleaningRulesPage = new CleaningRulesPage();
      cleaningRulesPage.goToPage();
      cleaningRulesPage.clickBtnNewCleaningRules();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cleaningRulesPage.btnSave.should('be.visible');
      cleaningRulesPage.clickEventBasedCleaningRules();
      cleaningRulesPage.clickProfileBasedCleaningRules();
      cleaningRulesPage.clickBtnNewCleaningRules();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      cleaningRulesPage.btnSave.should('be.visible');
    });
  });

  it('Should have datamartSelector on CompartmentEditPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const compartmentsPage = new CompartmentsPage();
      compartmentsPage.goToPage();
      compartmentsPage.clickBtnNewCompartments();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      compartmentsPage.btnSave.should('be.visible');
    });
  });

  it('Should have datamartSelector on DatamartReplicationEditPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const datamrtsPage = new DatamartsPage();
      cy.visit(`/#/v2/o/${data.organisationId}/settings/datamart/datamart_replication/create`);
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      datamrtsPage.datamartReplicationContainer.should('be.visible');
    });
  });

  it('Should have datamartSelector on AudiencePartitionPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const partitionsPage = new PartitionsPage();
      partitionsPage.goToPage();
      partitionsPage.clickBtnNewAudiencePartitions();
      partitionsPage.clickBtnRandomSplit();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      partitionsPage.btnSave.should('be.visible');
    });
  });

  it('Should have datamartSelector on EditMlFunctionPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const mlFunctionsPage = new MlFunctionsPage();
      mlFunctionsPage.goToPage();
      mlFunctionsPage.clickNewMlFunctionsButton();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      mlFunctionsPage.pageMlFunctions.should('contain', 'New Ml Function');
    });
  });

  it('Should have datamartSelector on MobileApplicationEditPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const channelsPage = new ChannelsPage();
      channelsPage.goToPage();
      channelsPage.clickBtnNewChannel();
      channelsPage.clickBtnNewMobileApplication();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      channelsPage.btnSaveMobileApplication.should('be.visible');
    });
  });

  it('Should have datamartSelector on SiteEditPage', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const channelsPage = new ChannelsPage();
      channelsPage.goToPage();
      channelsPage.clickBtnNewChannel();
      channelsPage.clickBtnNewSite();
      checkDatamartSelector(datamartName, data.datamartName);
      cy.contains(data.datamartName).click();
      channelsPage.btnSave.should('be.visible');
    });
  });
});
