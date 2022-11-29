import faker from 'faker';
import ListPage from '../../pageobjects/Automations/ListPage';
import BuilderPage from '../../pageobjects/Automations/BuilderPage';

describe('React To Event Advanced test', () => {
  beforeEach(() => {
    cy.login();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should test the creation of an automation with React to Event Advanced', () => {
    const builderPage = new BuilderPage();
    const listPage = new ListPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      cy.switchOrg(data.organisationName);
      // Automation Creation
      builderPage.goToPage();
      builderPage.selectReactToEventType();
      // Wait for the button to be enabled
      builderPage.startAutomationPopUp.btnStandarsEventsCofiguration.should(
        'not.have.attr',
        'disabled',
      );
      builderPage.startAutomationPopUp.clickBtnAdvancedConfiguration();
      const eventName = 'test_event_name';
      builderPage.startAutomationPopUp.typeEventName(eventName + '{enter}');
      builderPage.startAutomationPopUp.clickBtnSaveEditStartAutomation();
      builderPage.clickBtnSaveAutomation();
      const automationName = 'React to an Event Advanced';
      builderPage.typeAutomationName(automationName);
      builderPage.clickBtnSaveAutomationName();

      // Automation viewer
      // Wait for the automation to save
      listPage.nameBarShouldBeVisible();
      listPage.nameBarshouldContain(automationName);
      listPage.clickStartAutomation();
    });
  });
});
