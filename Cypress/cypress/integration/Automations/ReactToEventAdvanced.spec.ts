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
      listPage.nameBar.should('be.visible');
      listPage.nameBar.should('contain', automationName);

      // Edit
      const newEventName = faker.random.words(1);
      listPage.clickBtnEdit();
      listPage.clickStartAutomation();
      listPage.clickBtnEditQuery();
      builderPage.startAutomationPopUp.searchField.should('contain', eventName);
      builderPage.startAutomationPopUp.typeEventName(
        '{selectall}{backspace}' + newEventName + '{enter}',
      );
      builderPage.startAutomationPopUp.clickBtnSaveEditStartAutomation();
      builderPage.clickBtnSaveAutomation();
      const newAutomationName = faker.random.words(2);
      builderPage.typeAutomationName('{selectall}{backspace}' + newAutomationName);
      builderPage.clickBtnSaveAutomationName();
      // Wait for the automation to save
      listPage.nameBar.should('be.visible');
      listPage.nameBar.should('contain', newAutomationName);
      listPage.clickBtnEdit();
      listPage.clickStartAutomation();
      listPage.clickBtnEditQuery();
      listPage.startAutomationPopUp.searchField.should('contain', newEventName);
    });
  });
});
