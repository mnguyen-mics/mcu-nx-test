import faker from 'faker'

describe('User Expert Query Segment Form Test', () => {
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
    cy.restoreLocalStorageCache()
  })

  afterEach(() => {
    cy.saveLocalStorageCache()
  })

  it('should create User Expert Query Segment', () => {
    cy.contains('Segments').click()
    cy.contains('New Segment').click()
    cy.contains(datamartName).click()
    cy.contains('User Expert Query').click()

    cy.fillExpertQuerySegmentForm(segmentName, 'SELECT {id} FROM UserPoint')

    cy.contains('Save').click()
    cy.url({ timeout: 10000 }).should('match', /.*audience\/segments\/\d*\?/)
    cy.contains('Segments').click()
        // For some reason, the 'click' on the Type filter doesn't show the dropdown box with the segment types when segments are being fetched.
    // So we make sure that the segments are fetched first.
    cy.get('.mcs-campaigns-link').should('have.length.gte', 1)
    cy.contains('Type').click()
    cy.contains('User Query').click()
    cy.get('.mcs-search-input').type(segmentName + '{enter}')
    cy.get('[class="anticon anticon-database"]', { timeout: 5000 })
    // pick the created segment
    cy.get('.mcs-campaigns-link').should('have.length', 1).click()
    cy.get('.mcs-actionbar')
      .contains('Edit')
      .click()

      cy.fillExpertQuerySegmentForm(segmentName, ' WHERE creation_date <= "now-120d/d')

    cy.contains('Save').click()
    cy.url({ timeout: 5000 }).should('match', /.*audience\/segments\/\d*\?/)
  })
})
