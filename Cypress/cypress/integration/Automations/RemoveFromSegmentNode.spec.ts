describe('Test RemoveFromSegment node creation', () => {
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
          feed_type: 'SCENARIO',
        },
      }).then(() => {
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
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should test the creation of RemoveFromSegment node', () => {
    // Automation creation
    cy.get('.mcs-sideBar-subMenu_menu\\.automation\\.title').click();
    cy.get('.mcs-sideBar-subMenuItem_menu\\.automation\\.builder').click();
    cy.get('.mcs-menu-list-onSegmentEntry').click();
    cy.get('.mcs-formSearchInput').click().type('{enter}');
    cy.get('.mcs-form_saveButton_automationNodeForm').click();

    // Drag and Drop the node
    const dataTransfer = new DataTransfer();
    cy.get('.mcs-availableNode-DeletefromSegment')
      .trigger('mousedown')
      .trigger('dragstart', { dataTransfer });

    cy.get('.mcs-dropNodeWidget_area_node').trigger('drop');

    // Node form
    cy.get('.mcs-formSearchInput').click().type('{enter}');
    cy.get('.mcs-form_saveButton_automationNodeForm').click();

    //Save Automation
    cy.get('.mcs-actionbar').find('.mcs-primary').click();

    const automationName = 'Test RemoveFromSegment Node Automation';

    cy.get('.mcs-form-modal-container').find('.mcs-automationName').type(automationName);
    cy.get('.mcs-form-modal-container').find('.mcs-primary').click();

    //Wait for the automation to be saved
    cy.wait(20000);

    cy.get('.mcs-actionbar').should('contain', automationName);
  });
});
