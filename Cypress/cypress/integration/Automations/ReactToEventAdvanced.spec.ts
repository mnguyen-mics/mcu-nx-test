import faker from 'faker';

describe('React To Event Advanced test', () => {
  beforeEach(() => {
    cy.login();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should test the creation of an automation with React to Event Advanced', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      cy.switchOrg(data.organisationName);
      // Automation Creation
      cy.get('.mcs-sideBar-subMenu_menu\\.automation\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.automation\\.builder').click();
      cy.get('.mcs-menu-list-reactToEvent').click();
      // Wait for the button to be enabled
      cy.get('.mcs-reactToEventAutomation_buttonSwitchMode_reactToEventAdvanced')
        .children()
        .first()
        .children()
        .first()
        .should('not.have.attr', 'disabled');
      cy.get('.mcs-reactToEventAutomation_buttonSwitchMode_reactToEventAdvanced').click();
      const eventName = 'test_event_name';
      cy.get('.mcs-formSearchInput').type(eventName + '{enter}');
      cy.get('.mcs-form_saveButton_reactToEventForm').click();
      cy.get('.mcs-actionbar').find('.mcs-primary').click();
      const automationName = 'React to an Event Advanced';
      cy.get('.mcs-automationName').click().type(automationName);
      cy.get('.mcs-form-modal-container').find('.mcs-primary').click();

      // Automation viewer
      // Wait for the automation to save
      cy.get('.mcs-breadcrumb', { timeout: 50000 }).should('be.visible');
      cy.get('.mcs-breadcrumb').should('contain', automationName);

      // Edit
      const newEventName = faker.random.words(1);
      cy.get('.mcs-automationDashboardPage_editButton').click();
      cy.get('.mcs-automationNodeWidget_StartAutomation').parent().click();
      cy.get('.mcs-automationNodeWidget_booleanMenu_item_queryEdit').click();
      cy.get('.mcs-formSearchInput').should('contain', eventName);
      cy.get('.mcs-formSearchInput').type('{selectall}{backspace}' + newEventName + '{enter}');
      cy.get('.mcs-form_saveButton_reactToEventForm').click();
      cy.get('.mcs-actionbar').find('.mcs-primary').click();
      const newAutomationName = faker.random.words(2);
      cy.get('.mcs-automationName').click().type(newAutomationName);
      cy.get('.mcs-form-modal-container').find('.mcs-primary').click();
      // Wait for the automation to save
      cy.get('.mcs-breadcrumb', { timeout: 50000 }).should('be.visible');
      cy.get('.mcs-breadcrumb').should('contain', newAutomationName);
      cy.get('.mcs-automationDashboardPage_editButton').click();
      cy.get('.mcs-automationNodeWidget_StartAutomation').parent().click();
      cy.get('.mcs-automationNodeWidget_booleanMenu_item_queryEdit').click();
      cy.get('.mcs-formSearchInput').should('contain', newEventName);
    });
  });
});
