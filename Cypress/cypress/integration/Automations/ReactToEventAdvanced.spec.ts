describe('React To Event Advanced test',()=>{
before(() => {
  cy.login()
})
beforeEach(() => {
  cy.restoreLocalStorageCache()
})

afterEach(() => {
  cy.saveLocalStorageCache()
})

it('Should test the creation of an automation with React to Event Advanced', () => {
  cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
    cy.switchOrg(data.organisationName)
    // Automation Creation

    cy.contains('Automations').click()
    cy.contains('Builder').click()
    cy.contains('React to an Event').click()

    cy.wait(7500)
    cy.get('.mcs-reactToEventAutomation')
      .find('[value=REACT_TO_EVENT_ADVANCED]')
      .click({ force: true })

    const eventName = 'test_event_name'
    cy.get('.mcs-reactToEventAutomation')
      .contains('Search')
      .click()
      .type(eventName + '{enter}')

    cy.get('.drawer')
      .find('[type=submit]')
      .click()
    cy.get('.mcs-actionbar')
      .find('[type=button]')
      .click()

    const automationName = 'React to an Event Advanced'

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
    cy.get('.node-body')
      .contains('React to an event')
      .click({force:true})
    cy.get('.boolean-menu')
      .contains('Edit')
      .click()

    cy.wait(5000)
    cy.get('.mcs-reactToEventAutomation').find(`[title=${eventName}]`)
  })
})

})
