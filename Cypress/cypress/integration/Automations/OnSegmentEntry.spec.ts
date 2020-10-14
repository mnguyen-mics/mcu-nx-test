import { createUserQuery } from '../helpers/SegmentHelper'
import { createQuery } from '../helpers/QueryHelper'

before(() => {
  cy.login()
})
beforeEach(() => {
  cy.restoreLocalStorageCache()
})
afterEach(() => {
  cy.saveLocalStorageCache()
})

it('Should test the creation of an automation with On Segment Entry', () => {
  cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
    cy.switchOrg(data.organisationName)
    const query = await createQuery(data.datamartId, {
      datamart_id: data.datamartId,
      query_language: 'OTQL',
      query_text: 'select { id } from UserPoint'
    })
    const userQuery = await createUserQuery(
      data.datamartId,
      data.organisationId,
      query.id,
      'UserQuery for On Segment Entry'
    )

    // Automation Creation

    cy.contains('Automations').click()
    cy.contains('Builder').click()
    cy.contains('On Segment Entry').click()

    cy.get('#OnSegmentEntryInputSectionId')
      .find('.ant-select')
      .click()
      .type('{enter}')
    cy.get('.drawer')
      .find('[type=submit]')
      .click()
    cy.get('.mcs-actionbar')
      .find('[type=button]')
      .click()

    const automationName = 'On Segment Entry Automation'

    cy.get('.mcs-form-modal-container')
      .find('#name')
      .type(automationName)
    cy.get('.mcs-form-modal-container')
      .find('[type=submit]')
      .click()

    // Automation viewer

    cy.get('.mcs-actionbar').contains(automationName)

    // Edit

    cy.get('.mcs-actionbar')
      .find('[type=button]')
      .contains('Edit')
      .click({ force: true })

    // Open the drawer

    cy.get('.node-body')
      .contains('On audience segment entry')
      .click()
    cy.get('.boolean-menu')
      .contains('Edit')
      .click()

    // Check if the segment name in input is the one we had select on creation

    cy.get('#OnSegmentEntryInputSectionId').contains(userQuery.name)
  })
})
