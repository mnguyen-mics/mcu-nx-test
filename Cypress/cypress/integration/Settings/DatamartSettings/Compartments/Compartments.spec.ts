import faker from 'faker'

before(() => {
  cy.login()
  cy.readFile('cypress/fixtures/init_infos.json').then(data => {
    cy.switchOrg(data.organisationName)
  })
})

beforeEach(() => {
  cy.restoreLocalStorageCache()
})

afterEach(() => {
  cy.saveLocalStorageCache()
})

it('Should display settings/datamart/compartments list', () => {
  cy.readFile('cypress/fixtures/init_infos.json').then(data => {
    cy.goToHome(data.organisationId)

    cy.get('[class="mcs-options"]').click()
    cy.contains('Datamart').click()
    cy.contains('Compartments').click()

    // check columns
    cy.contains('Compartment ID')
    cy.contains('Name')
    cy.contains('Token')

    // check buttons
    cy.contains('New Compartment')
    cy.contains('Datamart')

    // check default compartment existence
    cy.get('tbody').within(() => {
      cy.get('tr').should('have.length', 1)
    })
  })
})

it('Should not submit form if missing required fields', () => {
  cy.readFile('cypress/fixtures/init_infos.json').then(data => {
    cy.goToHome(data.organisationId)

    cy.get('[class="mcs-options"]').click()
    cy.contains('Datamart').click()
    cy.contains('Compartments').click()

    cy.contains('New Compartment').click()
    cy.contains(`${data.datamartName}`).click()

    cy.get('form').submit()

    cy.get('[class="ant-form-item-control has-error"]').as('required-items')

    cy.get('@required-items').should('have.length', 2)
    cy.get('@required-items').within(() => {
      cy.contains('required')
    })
    cy.get('[class="mcs-close"]').click()
  })
})

it('Should create a compartment', () => {
  cy.readFile('cypress/fixtures/init_infos.json').then(data => {
    cy.goToHome(data.organisationId)

    cy.get('[class="mcs-options"]').click()
    cy.contains('Datamart').click()
    cy.contains('Compartments').click()

    cy.contains('New Compartment').click()
    cy.contains(`${data.datamartName}`).click()

    const compartmentName = faker.random.words(6)
    const compartmentToken = faker.random.words(2).replace(" ","-")
    cy.get('[id="compartment.name"]').type(compartmentName)
    cy.get('[id="compartment.token"]').type(compartmentToken)

    cy.contains('Advanced').click()
    cy.get('[name="compartment.default"').click()
    
    cy.get('form').submit()

    cy.contains(compartmentName).parents('tr').within(() => {
      cy.get('td').eq(0).contains('Default')
      cy.get('td').eq(1).contains(compartmentName)
      cy.get('td').eq(2).contains(compartmentToken)
    })

  })
})

it('Should edit a compartment', () => {
  cy.readFile('cypress/fixtures/init_infos.json').then(data => {
    cy.goToHome(data.organisationId)

    cy.get('[class="mcs-options"]').click()
    cy.contains('Datamart').click()
    cy.contains('Compartments').click()

    cy.get('[class="mcs-chevron"]').first().click()
    cy.contains('Edit').click()

    const compartmentName = faker.random.words(6)
    cy.get('[id="compartment.name"]').clear().type(compartmentName)
    cy.get('form').submit()
    cy.contains(compartmentName)
  })
})