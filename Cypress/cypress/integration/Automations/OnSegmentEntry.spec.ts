import { createUserQuery } from '../helpers/SegmentHelper';
import { createQuery } from '../helpers/QueryHelper';
import ListPage from '../../pageobjects/Automations/ListPage';
import BuilderPage from '../../pageobjects/Automations/BuilderPage';
describe('OnSegmentEntry test', () => {
  beforeEach(() => {
    cy.login();
  });
  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should test the creation of an automation with On Segment Entry', () => {
    const builderPage = new BuilderPage();
    const listPage = new ListPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      cy.switchOrg(data.organisationName);

      const query = await createQuery(
        data.datamartId,
        {
          datamart_id: data.datamartId,
          query_language: 'OTQL',
          query_text: 'select { id } from UserPoint',
        },
        data.accessToken,
      );
      const userQuery = await createUserQuery(
        data.datamartId,
        data.organisationId,
        query.id,
        'UserQuery for On Segment Entry',
        data.accessToken,
      );

      // Automation Creation

      builderPage.goToPage();
      builderPage.selectOnSegmentEntryType();

      builderPage.startAutomationPopUp.clickSearchField();
      builderPage.startAutomationPopUp.clickBtnUpdate();

      //Save Automation
      builderPage.clickBtnSaveAutomation();

      const automationName = 'On Segment Entry Automation';
      builderPage.typeAutomationName(automationName);
      builderPage.clickBtnSaveAutomationName();

      // Automation viewer
      listPage.nameBar.should('be.visible').should('contain', automationName);

      // Edit
      listPage.clickBtnEdit();

      // Open the drawer
      listPage.clickStartAutomation();
      listPage.clickBtnEditStartAutomation();

      // Check if the segment name in input is the one we had select on creation
      builderPage.startAutomationPopUp.searchField.should('contain', userQuery.name);
    });
  });
});
