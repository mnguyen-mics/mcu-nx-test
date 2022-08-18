import BuilderPage from '../../pageobjects/Automations/BuilderPage';
import faker from 'faker';
import ListPage from '../../pageobjects/Automations/ListPage';

describe('Test AddToSegment node creation', () => {
  beforeEach(() => {
    cy.login();
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      cy.switchOrg(data.organisationName);

      //Create a UserList Segment
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/audience_segments?organisation_id=${
          data.organisationId
        }`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          datamart_id: data.datamartId,
          type: 'USER_LIST',
          name: 'UserList Segment',
          persisted: 'true',
          feed_type: 'FILE_IMPORT',
        },
      });
    });
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should test the creation of AddToSegment node', () => {
    const builderPage = new BuilderPage();
    const listPage = new ListPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      // Automation creation
      builderPage.goToPage();
      builderPage.selectOnSegmentEntryType();
      builderPage.startAutomationPopUp.clickSearchField();
      builderPage.startAutomationPopUp.clickBtnUpdate();

      // Drag and Drop the node
      const dataTransfer = new DataTransfer();
      builderPage.componentAddToSegment.trigger('mousedown').trigger('dragstart', { dataTransfer });

      builderPage.componentsArea.trigger('drop');

      // Node form
      const audienceSegmentName = faker.random.words(2);
      builderPage.addToSegmentPopUp.typeAudienceSegmentName(audienceSegmentName);
      builderPage.addToSegmentPopUp.typeTimeToLiveValue('3');
      builderPage.addToSegmentPopUp.clickBtnUpdate();

      // Save Automation
      builderPage.clickBtnSaveAutomation();

      const automationName = 'Test AddToSegment Node Automation';

      builderPage.typeAutomationName(automationName);
      builderPage.clickBtnSaveAutomationName();

      // Wait for the automation to be saved
      listPage.nameBar.should('be.visible').should('contain', automationName);

      // Get scenario id
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/scenarios?organisation_id=${data.organisationId}`,
        method: 'GET',
        headers: { Authorization: data.accessToken },
      }).then(response => {
        const scenarioId = response.body.data[0].id;

        // Get segment id
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/scenarios/${scenarioId}/storyline/nodes`,
          method: 'GET',
          headers: { Authorization: data.accessToken },
        }).then(response => {
          const segmentId = response.body.data[1].user_list_segment_id;
          // Update ttl to 4 days
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/audience_segments/${segmentId}`,
            method: 'PUT',
            headers: { Authorization: data.accessToken },
            body: {
              datamart_id: `${data.datamartId}`,
              type: 'USER_LIST',
              feed_type: 'SCENARIO',
              name: audienceSegmentName,
              default_ttl: 345600000,
            },
          });
        });
      });
    });

    // Reload the page
    cy.reload();
    listPage.nameBar.should('be.visible');

    // Check if the ttl value of the add_to_segment node has been updated
    builderPage.clickAnalystHandcrafted();
    builderPage.clickBtnViewNodeConfig();
    builderPage.addToSegmentPopUp.timeToLiveValue.should('have.value', '4');
  });

  it('Segment name field should not be empty in AddToSegment form', () => {
    const builderPage = new BuilderPage();
    // Automation creation
    builderPage.goToPage();
    builderPage.selectOnSegmentEntryType();
    builderPage.startAutomationPopUp.clickSearchField();
    builderPage.startAutomationPopUp.clickBtnUpdate();

    // Drag and Drop the node
    const dataTransfer = new DataTransfer();
    builderPage.componentAddToSegment.trigger('mousedown').trigger('dragstart', { dataTransfer });

    builderPage.componentsArea.trigger('drop');

    // Node form
    builderPage.startAutomationPopUp.clickBtnUpdate();
    builderPage.addToSegmentPopUp.addToSegmentSectionForm.should('contain', 'required');
  });

  it('Should have the valid input in the time to live field', () => {
    const builderPage = new BuilderPage();
    // Automation creation
    builderPage.goToPage();
    builderPage.selectOnSegmentEntryType();
    builderPage.startAutomationPopUp.clickSearchField();
    builderPage.startAutomationPopUp.clickBtnUpdate();

    // Drag and Drop the node
    const dataTransfer = new DataTransfer();
    builderPage.componentAddToSegment.trigger('mousedown').trigger('dragstart', { dataTransfer });

    builderPage.componentsArea.trigger('drop');

    // Node form
    const inputString = faker.random.word();
    // String input
    builderPage.addToSegmentPopUp.typeTimeToLiveValue(inputString);
    builderPage.addToSegmentPopUp.addToSegmentSectionForm.click();
    builderPage.addToSegmentPopUp.addToSegmentSectionForm.should('contain', 'invalid number');

    // Zero input
    builderPage.addToSegmentPopUp.typeTimeToLiveValue('{selectall}{backspace}');
    builderPage.addToSegmentPopUp.typeTimeToLiveValue('0');
    builderPage.addToSegmentPopUp.addToSegmentSectionForm.should(
      'contain',
      'Number must be above 0',
    );

    // Float input
    builderPage.addToSegmentPopUp.typeTimeToLiveValue('{selectall}{backspace}');
    builderPage.addToSegmentPopUp.typeTimeToLiveValue('1.5');
    builderPage.addToSegmentPopUp.addToSegmentSectionForm.should('contain', 'invalid number');
  });

  it('Should display a scenario containing an AddToSegment node with a deleted segment', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const builderPage = new BuilderPage();
      const listPage = new ListPage();
      // Automation creation
      builderPage.goToPage();
      builderPage.selectOnSegmentEntryType();
      builderPage.startAutomationPopUp.clickSearchField();
      builderPage.startAutomationPopUp.clickBtnUpdate();

      // Drag and Drop the node
      const dataTransfer = new DataTransfer();
      builderPage.componentAddToSegment.trigger('mousedown').trigger('dragstart', { dataTransfer });
      builderPage.componentsArea.trigger('drop');

      // Node form
      const audienceSegmentName = faker.random.words(2);
      builderPage.addToSegmentPopUp.typeAudienceSegmentName(audienceSegmentName);
      builderPage.addToSegmentPopUp.typeTimeToLiveValue('3');
      builderPage.addToSegmentPopUp.clickBtnUpdate();

      // Save Automation
      builderPage.clickBtnSaveAutomation();

      const automationName = 'Test AddToSegment Node Automation';

      builderPage.typeAutomationName(automationName);
      builderPage.clickBtnSaveAutomationName();

      // Wait for the automation to be saved
      listPage.nameBar.should('be.visible').should('contain', automationName);

      // Get scenario id
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/scenarios?organisation_id=${data.organisationId}`,
        method: 'GET',
        headers: { Authorization: data.accessToken },
      }).then(response => {
        const scenarioId = response.body.data[0].id;

        // Get segment id
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/scenarios/${scenarioId}/storyline/nodes`,
          method: 'GET',
          headers: { Authorization: data.accessToken },
        }).then(response => {
          const segmentId = response.body.data[1].user_list_segment_id;
          // Delete segment
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/audience_segments/${segmentId}`,
            method: 'DELETE',
            headers: { Authorization: data.accessToken },
          });
        });

        // Go to the automation view page
        listPage.clickAutomationsList();
        cy.contains(automationName).click();
        listPage.nameBar.should('contain', automationName);
      });
    });
  });
});
