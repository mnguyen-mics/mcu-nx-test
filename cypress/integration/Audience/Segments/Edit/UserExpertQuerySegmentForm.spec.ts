import faker from 'faker'

describe('User Expert Query Segment Form Test', () => {
  const organisationName = 'yellow velvet'
  const datamartName = 'YV Pionus'
  const segmentName = `${Date.now()}-${faker.random.words(2)}`

  function fillSegmentForm() {
    cy.contains('Save', { timeout: 5000 })
    cy.get('input[name="audienceSegment.name"]')
      .clear()
      .type(segmentName)
    cy.get('textarea[name="audienceSegment.short_description"]')
      .clear()
      .type(faker.random.words(6))
    cy.contains('Advanced').click()
    cy.get('input[name="audienceSegment.technical_name"]')
      .clear()
      .type(faker.random.words(2))
    cy.get('input[name="audienceSegment.defaultLiftime"]')
      .clear()
      .type('1')
    cy.get('[id="audienceSegment.defaultLiftimeUnit"]').click()
    cy.contains('Days').click()
    cy.get('[id="properties"').within(() => {
      cy.get('[id="brace-editor"]')
        .get('textarea[class="ace_text-input"]')
        .clear({ force: true })
        .type('SELECT {id} FROM UserPoint', {
          force: true,
          parseSpecialCharSequences: false,
          delay: 0,
        })
    })
  }

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

    fillSegmentForm()

    cy.contains('Save').click({ force: true })
    cy.url({ timeout: 5000 }).should('match', /.*audience\/segments\/\d*\?/)
  })

  it('should edit User Query Segment', () => {
    cy.get('.mcs-campaigns-link')
    cy.contains('Type').click({ force: true })
    cy.contains('USER_QUERY').click({ force: true })
    cy.get('[class="anticon anticon-database"]', { timeout: 5000 })
    // pick the first USER_QUERY segment found
    cy.get('.mcs-campaigns-link')
      .first()
      .click()
    cy.get('.mcs-actionbar')
      .contains('Edit')
      .click({ force: true })

    fillSegmentForm()

    cy.contains('Save').click({ force: true })
    cy.url({ timeout: 5000 }).should('match', /.*audience\/segments\/\d*\?/)
  })
})
