import { createUserQuery } from '../helpers/SegmentHelper';
import { createQuery } from '../helpers/QueryHelper';
describe('OnSegmentEntry test', () => {
  beforeEach(() => {
    cy.login();
  });
  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should test the creation of an automation with On Segment Entry', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      cy.switchOrg(data.organisationName);
      const query = await createQuery(data.datamartId, {
        datamart_id: data.datamartId,
        query_language: 'OTQL',
        query_text: 'select { id } from UserPoint',
      });
      const userQuery = await createUserQuery(
        data.datamartId,
        data.organisationId,
        query.id,
        'UserQuery for On Segment Entry',
      );

      // Automation Creation

      cy.get('.mcs-sideBar-subMenu_menu\\.automation\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.automation\\.builder').click();
      cy.get('.mcs-menu-list-onSegmentEntry').click();

      cy.get('.mcs-formSearchInput').click().type('{enter}');
      cy.get('.mcs-form_saveButton_automationNodeForm').click();

      //Save Automation
      cy.get('.mcs-actionbar').find('.mcs-primary').click();

      const automationName = 'On Segment Entry Automation';
      cy.get('.mcs-automationName').type(automationName);
      cy.get('.mcs-form-modal-container').find('.mcs-primary').click();

      // Automation viewer
      cy.get('.mcs-breadcrumb', { timeout: 50000 })
        .should('be.visible')
        .should('contain', automationName);

      // Edit
      cy.get('.mcs-automationDashboardPage_editButton').click();

      // Open the drawer
      cy.get('.mcs-automationNodeWidget_StartAutomation').parent().click();
      cy.get('.mcs-automationNodeWidget_booleanMenu--edit').click();

      // Check if the segment name in input is the one we had select on creation
      cy.get('.mcs-formSearchInput').should('contain', userQuery.name);
    });
  });
});
