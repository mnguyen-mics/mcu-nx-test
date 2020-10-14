import faker from 'faker'

before(() => {
  cy.login()
  cy.readFile('cypress/fixtures/init_infos.json').then((data) => {
    cy.switchOrg(data.organisationName)
  })
})

beforeEach(() => {
  cy.restoreLocalStorageCache()
})

afterEach(() => {
  cy.saveLocalStorageCache()
})

it('Should display partitions list', () => {
  cy.readFile('cypress/fixtures/init_infos.json').then((data) => {
    cy.goToHome(data.organisationId)

    cy.get('[class="mcs-options"]').click()
    cy.contains('Datamart').click()
    cy.contains('Partitions').click()

    // check columns
    cy.contains('Name')
    cy.contains('Type')
    cy.contains('Part Count')
    cy.contains('Status')

    // check buttons
    cy.contains('New Partition')

    // check default partition existence
    cy.get('tbody').within(() => {
      cy.get('tr').should('have.length', 1)
    })
    cy.contains('AB partition')
      .parents('tr')
      .within(() => {
        cy.get('td').eq(0).contains('AB partition')
        cy.get('td').eq(1).contains('RANDOM_SPLIT')
        cy.get('td').eq(2).contains('100')
        cy.get('td').eq(3).contains('PUBLISHED')
      })
  })
})

it('Should create a new RANDOM_SPLIT partition and publish it', () => {
  cy.readFile('cypress/fixtures/init_infos.json').then((data) => {
    cy.goToHome(data.organisationId)

    cy.get('[class="mcs-options"]').click()
    cy.contains('Datamart').click()
    cy.contains('Partitions').click()

    cy.contains('New Partition').click()
    cy.contains('Random Split').click()

    const partitionName = faker.random.words(6)
    const partCount = 10
    cy.get('[id="name"]').type(partitionName)
    cy.get('[id="part_count"]').type(`${partCount}`)

    cy.get('form').submit()

    cy.contains('Publish').click()
    cy.contains('OK').click()

    cy.get('[class="mcs-contentHeader_title--large"]').should('contain', partitionName)

    cy.contains('Partition number')
    cy.contains('Users')
    cy.contains('Percentage')

    cy.get('tbody').within(() => {
      cy.get('tr').should('have.length', partCount)
    })
  })
})
