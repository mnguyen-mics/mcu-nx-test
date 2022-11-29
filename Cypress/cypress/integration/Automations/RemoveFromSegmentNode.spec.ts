import BuilderPage from '../../pageobjects/Automations/BuilderPage';

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
    const builderPage = new BuilderPage();
    // Automation creation
    builderPage.goToPage();
    builderPage.selectOnSegmentEntryType();
    builderPage.startAutomationPopUp.clickSearchField();
    builderPage.startAutomationPopUp.clickBtnUpdate();

    // Drag and Drop the node
    const dataTransfer = new DataTransfer();
    builderPage.componentDeleteFromSegment
      .trigger('mousedown')
      .trigger('dragstart', { dataTransfer });

    builderPage.componentsArea.trigger('drop');

    // Node form
    builderPage.startAutomationPopUp.clickSearchField();
    builderPage.startAutomationPopUp.clickBtnUpdate();

    //Save Automation
    builderPage.clickBtnSaveAutomation();

    const automationName = 'Test RemoveFromSegment Node Automation';

    builderPage.typeAutomationName(automationName);
    builderPage.clickBtnSaveAutomationName();

    //Wait for the automation to be saved
    cy.wait(20000);

    builderPage.actionBar.should('contain', automationName);
  });
});
