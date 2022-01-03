import faker from 'faker';
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
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      // Automation creation
      cy.get('.mcs-sideBar-subMenu_menu\\.automation\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.automation\\.builder').click();
      cy.get('.mcs-menu-list-onSegmentEntry').click();
      cy.get('.mcs-formSearchInput').click().type('{enter}');
      cy.get('.mcs-form_saveButton_automationNodeForm').click();

      // Drag and Drop the node
      const dataTransfer = new DataTransfer();
      cy.get('.mcs-availableNode-AddtoSegment')
        .trigger('mousedown')
        .trigger('dragstart', { dataTransfer });

      cy.get('.mcs-dropNodeWidget_area_node').trigger('drop');

      // Node form
      const audienceSegmentName = faker.random.words(2);
      cy.get('.mcs-audienceSegmentName').type(audienceSegmentName);
      cy.get('.mcs-ttlValue').click().type('3');
      cy.get('.mcs-form_saveButton_automationNodeForm').click();

      // Save Automation
      cy.get('.mcs-actionbar').find('.mcs-primary').click();

      const automationName = 'Test AddToSegment Node Automation';

      cy.get('.mcs-form-modal-container').find('.mcs-automationName').type(automationName);
      cy.get('.mcs-form-modal-container').find('.mcs-primary').click();

      // Wait for the automation to be saved
      cy.get('.mcs-breadcrumb', { timeout: 50000 })
        .should('be.visible')
        .should('contain', automationName);

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
    cy.get('.mcs-breadcrumb', { timeout: 50000 }).should('be.visible');

    // Check if the ttl value of the add_to_segment node has been updated
    cy.get('.mcs-user-list').click();
    cy.get('.mcs-automationNodeWidget_booleanMenu--view-node-config').click();
    cy.get('.mcs-ttlValue').find('#ttl\\.value').should('have.value', '4');
  });

  it('Segment name field should not be empty in AddToSegment form', () => {
    // Automation creation
    cy.get('.mcs-sideBar-subMenu_menu\\.automation\\.title').click();
    cy.get('.mcs-sideBar-subMenuItem_menu\\.automation\\.builder').click();
    cy.get('.mcs-menu-list-onSegmentEntry').click();
    cy.get('.mcs-formSearchInput').click().type('{enter}');
    cy.get('.mcs-form_saveButton_automationNodeForm').click();

    // Drag and Drop the node
    const dataTransfer = new DataTransfer();
    cy.get('.mcs-availableNode-AddtoSegment')
      .trigger('mousedown')
      .trigger('dragstart', { dataTransfer });

    cy.get('.mcs-dropNodeWidget_area_node').trigger('drop');

    // Node form
    cy.get('.mcs-form_saveButton_automationNodeForm').click();
    cy.get('.mcs-addToSegmentSectionForm').should('contain', 'required');
  });

  it('Should have the valid input in the time to live field', () => {
    // Automation creation
    cy.get('.mcs-sideBar-subMenu_menu\\.automation\\.title').click();
    cy.get('.mcs-sideBar-subMenuItem_menu\\.automation\\.builder').click();
    cy.get('.mcs-menu-list-onSegmentEntry').click();
    cy.get('.mcs-formSearchInput').click().type('{enter}');
    cy.get('.mcs-form_saveButton_automationNodeForm').click();

    // Drag and Drop the node
    const dataTransfer = new DataTransfer();
    cy.get('.mcs-availableNode-AddtoSegment')
      .trigger('mousedown')
      .trigger('dragstart', { dataTransfer });

    cy.get('.mcs-dropNodeWidget_area_node').trigger('drop');

    // Node form
    const inputString = faker.random.word();
    // String input
    cy.get('.mcs-ttlValue').click().type(inputString);
    cy.get('.mcs-addToSegmentSectionForm').click();
    cy.get('.mcs-addToSegmentSectionForm').should('contain', 'invalid number');

    // Zero input
    cy.get('.mcs-ttlValue').click().type('{selectall}{backspace}');
    cy.get('.mcs-ttlValue').click().type('0');
    cy.get('.mcs-addToSegmentSectionForm').should('contain', 'Number must be above 0');

    // Float input
    cy.get('.mcs-ttlValue').click().type('{selectall}{backspace}');
    cy.get('.mcs-ttlValue').click().type('1.5');
    cy.get('.mcs-addToSegmentSectionForm').should('contain', 'invalid number');
  });

  it('Should display a scenario containing an AddToSegment node with a deleted segment', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      // Automation creation
      cy.get('.mcs-sideBar-subMenu_menu\\.automation\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.automation\\.builder').click();
      cy.get('.mcs-menu-list-onSegmentEntry').click();
      cy.get('.mcs-formSearchInput').click().type('{enter}');
      cy.get('.mcs-form_saveButton_automationNodeForm').click();

      // Drag and Drop the node
      const dataTransfer = new DataTransfer();
      cy.get('.mcs-availableNode-AddtoSegment')
        .trigger('mousedown')
        .trigger('dragstart', { dataTransfer });
      cy.get('.mcs-dropNodeWidget_area_node').trigger('drop');

      // Node form
      const audienceSegmentName = faker.random.words(2);
      cy.get('.mcs-audienceSegmentName').type(audienceSegmentName);
      cy.get('.mcs-ttlValue').click().type('3');
      cy.get('.mcs-form_saveButton_automationNodeForm').click();

      // Save Automation
      cy.get('.mcs-actionbar').find('.mcs-primary').click();

      const automationName = 'Test AddToSegment Node Automation';

      cy.get('.mcs-form-modal-container').find('.mcs-automationName').type(automationName);
      cy.get('.mcs-form-modal-container').find('.mcs-primary').click();

      // Wait for the automation to be saved
      cy.get('.mcs-breadcrumb', { timeout: 50000 })
        .should('be.visible')
        .should('contain', automationName);

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
        cy.get('.mcs-sideBar-subMenuItem_menu\\.automation\\.list').click();
        cy.contains(automationName).click();
        cy.get('.mcs-breadcrumb').should('contain', automationName);
      });
    });
  });
});
