import HeaderMenu from '../../../../pageobjects/HeaderMenu';
import ActivityAnalyserPage from '../../../../pageobjects/Settings/Datamart/ActivityAnalyser/ActivityAnalyserPage';
import ChannelsPage from '../../../../pageobjects/Settings/Datamart/Channels/ChannelsPage';
import faker from 'faker';

describe('Should test the visit analyzers', () => {
  afterEach(() => {
    cy.clearLocalStorage();
  });

  beforeEach(() => {
    cy.login();
  });

  it('should test the visit analyzers form', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const activityAnalyserPage = new ActivityAnalyserPage();
      HeaderMenu.switchOrg(data.organisationName);
      activityAnalyserPage.goToPage();
      activityAnalyserPage.clickBtnNewActivityAnalyser();
      activityAnalyserPage.activityAnalyserTypePage.clickDefaultActivityAnalyser();
      activityAnalyserPage.activityAnalyserPropertiesPage.typeName();
      activityAnalyserPage.activityAnalyserPropertiesPage.clickErrorRecoveryStrategySelect();
      activityAnalyserPage.activityAnalyserPropertiesPage.clickErrorRecoveryStrategy_Drop();
      activityAnalyserPage.activityAnalyserPropertiesPage.clickBtnSave();
      activityAnalyserPage.clickOnName(activityAnalyserPage.visitAnalyserName);
      const newVisitAnalyzerName = faker.random.words(2);
      activityAnalyserPage.activityAnalyserPropertiesPage.nameField.should(
        'have.value',
        activityAnalyserPage.visitAnalyserName,
      );
      activityAnalyserPage.activityAnalyserPropertiesPage.typeName(newVisitAnalyzerName);
      activityAnalyserPage.activityAnalyserPropertiesPage.clickErrorRecoveryStrategySelect();
      activityAnalyserPage.activityAnalyserPropertiesPage.clickErrorRecoveryStrategy_StoreWithErrorIdAndSkipUpcomingAnalysers();
      activityAnalyserPage.activityAnalyserPropertiesPage.clickBtnSave();
      activityAnalyserPage.clickOnName(newVisitAnalyzerName);
      activityAnalyserPage.activityAnalyserPropertiesPage.nameField.should(
        'have.value',
        newVisitAnalyzerName,
      );
      activityAnalyserPage.activityAnalyserPropertiesPage.errorRecoveryStrategySelect.should(
        'contain',
        'Store With Error Id And Skip Upcoming Analyzers',
      );
    });
  });

  it('we cant save visit analyzer with missing fields', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const activityAnalyserPage = new ActivityAnalyserPage();
      HeaderMenu.switchOrg(data.organisationName);
      activityAnalyserPage.goToPage();
      activityAnalyserPage.clickBtnNewActivityAnalyser();
      activityAnalyserPage.activityAnalyserTypePage.clickDefaultActivityAnalyser();
      activityAnalyserPage.activityAnalyserPropertiesPage.typeName();
      activityAnalyserPage.activityAnalyserPropertiesPage.clickBtnSave();

      cy.url().should('contain', 'create');
    });
  });

  it('should test the visit analyzer section on channels section', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const activityAnalyserPage = new ActivityAnalyserPage();
      const channelsPage = new ChannelsPage();

      const firstVisitAnalyzerName = faker.random.word();
      const secondVisitAnalyzerName = faker.random.word();
      const thirdVisitAnalyzerName = faker.random.word();

      HeaderMenu.switchOrg(data.organisationName);
      activityAnalyserPage.goToPage();

      activityAnalyserPage.createActivityAnalyser(firstVisitAnalyzerName, 'drop');
      activityAnalyserPage.createActivityAnalyser(secondVisitAnalyzerName, 'storeWithErrorId');
      activityAnalyserPage.createActivityAnalyser(
        thirdVisitAnalyzerName,
        'storeWithErrorIdAndSkipUpcomingAnalysers',
      );

      channelsPage.goToPage();
      channelsPage.clickBtnNewChannel();
      channelsPage.clickBtnNewSite();
      channelsPage.selectDatamartPage.clickOnDatamart(data.datamartName);
      channelsPage.siteInformation.typeName();
      channelsPage.siteInformation.typeToken();
      channelsPage.siteInformation.typeDomain();
      channelsPage.siteInformation.clickBtnAddActivityAnalyser();
      channelsPage.siteInformation.selectActivityAnalyserPage.clickOnActivityAnalyser(
        firstVisitAnalyzerName,
      );
      channelsPage.siteInformation.selectActivityAnalyserPage.clickBtnAdd();
      channelsPage.siteInformation.clickBtnAddActivityAnalyser();
      channelsPage.siteInformation.selectActivityAnalyserPage.clickOnActivityAnalyser(
        secondVisitAnalyzerName,
      );
      channelsPage.siteInformation.selectActivityAnalyserPage.clickBtnAdd();
      channelsPage.siteInformation.clickBtnAddActivityAnalyser();
      channelsPage.siteInformation.selectActivityAnalyserPage.clickOnActivityAnalyser(
        thirdVisitAnalyzerName,
      );
      channelsPage.siteInformation.selectActivityAnalyserPage.clickBtnAdd();
      channelsPage.siteInformation.clickBtnSave();
      channelsPage.typeSearchChannels();
      channelsPage.clickOnName();
      channelsPage.siteInformation.scrollIntoViewErrorRecoveryStrategy();
      cy.wait(5000);
      channelsPage.siteInformation.errorRecoveryStrategyAtPos(0).should('contain', 'DROP');
      channelsPage.siteInformation
        .errorRecoveryStrategyAtPos(1)
        .should('contain', 'STORE_WITH_ERROR_ID');
      channelsPage.siteInformation
        .errorRecoveryStrategyAtPos(2)
        .should('contain', 'STORE_WITH_ERROR_ID_AND_SKIP_UPCOMING_ANALYZERS');
      channelsPage.siteInformation.clickBtnSortTimelineStepBuilderAtPos(1);
      channelsPage.siteInformation.clickBtnSortTimelineStepBuilderAtPos(3);
      channelsPage.siteInformation.clickBtnSave();
      channelsPage.typeSearchChannels();
      channelsPage.clickOnName();
      channelsPage.siteInformation.scrollIntoViewErrorRecoveryStrategy();
      cy.wait(5000);
      channelsPage.siteInformation
        .errorRecoveryStrategyAtPos(0)
        .should('contain', 'STORE_WITH_ERROR_ID');
      channelsPage.siteInformation
        .errorRecoveryStrategyAtPos(1)
        .should('contain', 'STORE_WITH_ERROR_ID_AND_SKIP_UPCOMING_ANALYZERS');
      channelsPage.siteInformation.errorRecoveryStrategyAtPos(2).should('contain', 'DROP');
    });
  });
});
