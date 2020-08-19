import faker from 'faker'

describe('AudienceExperimentation Form Test', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    cy.restoreLocalStorageCache()
  })

  afterEach(() => {
    cy.saveLocalStorageCache()
  })

  it('should create User Expert Query Segment and an audience experimentation segment', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const segmentName = `${Date.now()}-${faker.random.words(2)}`
      cy.switchOrg(data.organisationName)
      cy.contains('Audience').click()
      cy.contains('Segments').click()
      cy.contains('New Segment').click()
      cy.contains('User Expert Query').click()
      cy.fillExpertQuerySegmentForm(segmentName, 'SELECT {id} FROM UserPoint')
      cy.contains('Save').click()
      cy.url({ timeout: 10000 }).should('match', /.*audience\/segments\/\d*\?/)
      cy.contains('Segments').click()
      cy.get('[placeholder="Search Segments"]')
        .type(segmentName)
        .type('{enter}')
      cy.get('.mcs-campaigns-link')
        .should('have.length', 1)
        .click()
      cy.get('.ant-dropdown-trigger > .compact').click({ force: true })
      cy.contains('Create Experimentation').click()
      cy.get('.mcs-menu-list')
        .first()
        .click()
      cy.get('[class="ant-slider"]').click()
      cy.get('[type="submit"]').click()
      cy.url().should('contain', `${data.organisationId}/audience/segments/`)
    })
  })
})
