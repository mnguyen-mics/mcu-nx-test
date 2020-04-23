import faker from 'faker'

describe('AudienceExperimentation Form Test', () => {
  const organisationName = 'yellow velvet'
  const datamartName = 'YV Pionus'
  const segmentName = `${Date.now()}-${faker.random.words(2)}`

  before(() => {
    cy.login()
    cy.url({ timeout: 5000 }).should(
      'contain',
      Cypress.config().baseUrl + '/#/v2/o/1/campaigns/display',
    )
    cy.switchOrg(organisationName)
    cy.contains('Audience').click()
  })

  beforeEach(() => {
    cy.viewport(1920, 1080)
    cy.restoreLocalStorageCache()
    cy.contains('Segments').click()
  })

  afterEach(() => {
    cy.saveLocalStorageCache()
  })

  it('should create User Expert Query Segment', () => {
    cy.contains('New Segment').click({ force: true })
    cy.contains(datamartName).click()
    cy.contains('User Expert Query').click()

    cy.fillExpertQuerySegmentForm(segmentName)

    cy.contains('Save').click({ force: true })
    cy.url({ timeout: 5000 }).should('match', /.*audience\/segments\/\d*\?/)
  })

  it('should create an experimentation form', () => {
    // search the test segment we just created
    cy.get('[placeholder="Search Segments"]').type(segmentName).type('{enter}')
    cy.wait(500)
    // get the first segment in list
    cy.get('.mcs-campaigns-link')
    .first()
    .click()

    cy.get('.ant-dropdown-trigger > .compact')
    .click({ force: true })

    cy.contains('Create Experimentation')
    .click({ force: true })

    cy.get('.menu-item')
    .first()
    .click()

    cy.contains('Save').click({ force: true })

  })

})
