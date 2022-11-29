import { createUserQuery } from '../helpers/SegmentHelper';
import { createQuery } from '../helpers/QueryHelper';
describe('OnSegmentExit test', () => {
  before(() => {
    cy.login();
  });
  beforeEach(() => {
    cy.restoreLocalStorageCache();
  });
  afterEach(() => {
    cy.saveLocalStorageCache();
  });

  // TODO remove skip when feature 'automations-on-segment-exit' is available on prod
  it.skip('Should test the creation of an automation with On Segment Exit', () => {
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

      cy.contains('Automations').click();
      cy.contains('Builder').click();
      cy.contains('On Segment Exit').click();

      cy.get('#OnSegmentExitInputSectionId').find('.ant-select').click().type('{enter}');
      cy.get('.drawer').find('[type=submit]').click();
      cy.get('.mcs-actionbar').find('[type=button]').click();

      const automationName = 'On Segment Exit Automation';

      cy.get('.mcs-form-modal-container').find('#name').type(automationName);
      cy.get('.mcs-form-modal-container').find('[type=submit]').click();

      // Automation viewer

      cy.get('.mcs-actionbar').contains(automationName);

      // Edit

      cy.get('.mcs-actionbar').find('[type=button]').contains('Edit').click({ force: true });

      // Open the drawer

      cy.get('.node-body').contains('On audience segment exit').click();
      cy.get('.boolean-menu').contains('Edit').click();

      // Check if the segment name in input is the one we had select on creation

      cy.get('#OnSegmentExitInputSectionId').contains(userQuery.name);
    });
  });
});
