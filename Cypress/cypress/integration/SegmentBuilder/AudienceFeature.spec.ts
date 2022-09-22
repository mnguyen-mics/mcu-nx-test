import DatamartsPage from '../../pageobjects/Settings/Datamart/DatamartsPage';
import AudienceFeatures from '../../pageobjects/Settings/Datamart/DatamartsPage/AudienceFeatures';

describe('This test should check that the audience feature forms are working properly', () => {
  beforeEach(() => {
    cy.login();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
    });
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should test the audience feature forms', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const datamartsPage = new DatamartsPage();
      const audienceFeatures = new AudienceFeatures();
      datamartsPage.goToPage();
      //cy.get('.mcs-header_actions_settings').click();
      //cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      //cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
      cy.contains(data.datamartName).click();

      datamartsPage.clickOnAudienceFeaturesTab();
      //cy.get('.mcs-tabs_tab--audienceFeatures').click();

      audienceFeatures.create(
        'Test Audience Feature Form',
        'Test Audience Feature Form',
        'SELECT {id} From UserPoint WHERE creation_date = $test',
      );

      audienceFeatures.shouldContain('creation_date = $test');
      audienceFeatures.shouldContain('Test Audience Feature Form');

      audienceFeatures.editTheFirstOne();
      audienceFeatures.queryShouldContains('creation_date = $test');
      audienceFeatures.queryShouldContains('@count');

      audienceFeatures.setName('Test Audience Feature From - Edit');
      audienceFeatures.setDescription('Test Audience Feature From - Edit');

      audienceFeatures.setQuery('select {id} from UserPoint where id = $id');
      audienceFeatures.clickSave();
      audienceFeatures.shouldContain('id = $id');

      // Delete an audience feature
      audienceFeatures.deleteTheFirstOne();

      audienceFeatures.shouldNotContain('Test Audience Feature Form - Edit');
    });
  });

  it('audience feature shouldnt be created if the query is invalid', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const datamartsPage = new DatamartsPage();
      const audienceFeatures = new AudienceFeatures();
      datamartsPage.goToPage();
      //cy.get('.mcs-header_actions_settings').click();
      //cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      //cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.myDatamart').click();
      cy.contains(data.datamartName).click();

      datamartsPage.clickOnAudienceFeaturesTab();

      audienceFeatures.clickCreate();
      audienceFeatures.setName('Test Audience Feature Form 2');
      audienceFeatures.setDescription('Test Audience Feature Form 2');
      audienceFeatures.setQuery('SELECT {id} from UserPoint');
      // it fails here, close the query editor
      audienceFeatures.clickCloseEditQuery();
    });
  });
});
