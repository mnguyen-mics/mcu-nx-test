import faker from 'faker'

before(() => {
  cy.login()
})
beforeEach(() => {
  cy.restoreLocalStorageCache()
})

afterEach(() => {
  cy.saveLocalStorageCache()
})

it('should create a user lookalike segment from user list segment and edit it', () => {
  const segmentDescription = faker.random.words(3)
  cy.readFile('cypress/fixtures/init_infos.json').then(data => {
    cy.switchOrg(data.organisationName)
    cy.contains('Audience').click()
    cy.contains('Segments').click()
    cy.createSegmentFromUI('User List')
    cy.get('.mcs-dots').click({ force: true })
    cy.contains('Create Lookalike').click()
    cy.contains('Partition based lookalike').click()
    cy.get('[id="name"]').type(faker.random.words(2))
    cy.get('[class="ant-slider"]').click()
    cy.get('[type="submit"]').click()
    cy.url().should('match', /.*segments\/[0-9]+/)
    // Wait for backend processing
    cy.wait(1500)
    cy.url().then(url => {
      const segmentId: number = parseInt(
        url.substring(url.indexOf('segments') + 9, url.length),
        10
      )
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/audience_segments/${segmentId}`,
        method: 'GET',
        headers: { Authorization: data.accessToken }
      }).then(responseSegment => {
        expect(responseSegment.body.data.type).to.eq('USER_LOOKALIKE')
        cy.get('.mcs-pen').click({force:true})
        cy.get('[id="audienceSegment.short_description"]').type(
          segmentDescription
        )
        cy.get('[class="mcs-button optional-section-title"]').click()
        cy.get('[id="defaultLifetime"]').clear().type('1')
        cy.contains('Save').click()
        cy.url().should('match', /.*segments\/[0-9]+/)
        // Wait for backend processing
        cy.wait(1500)
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/audience_segments/${segmentId}`,
          method: 'GET',
          headers: { Authorization: data.accessToken }
        }).then(responseSegmentUpdated => {
          expect(responseSegmentUpdated.body.data.type).to.eq('USER_LOOKALIKE')
          expect(responseSegmentUpdated.body.data.short_description).to.eq(segmentDescription)
          expect(responseSegmentUpdated.body.data.default_ttl).to.eq(1 * 24 * 60 * 60 * 1000)
        })
      })
    })
  })
})

it('should create a user lookalike segment from user pixel segment', () => {
  cy.readFile('cypress/fixtures/init_infos.json').then(data => {
    cy.switchOrg(data.organisationName)
    cy.contains('Audience').click()
    cy.contains('Segments').click()
    cy.createSegmentFromUI('User Pixel')
    cy.contains('Save').click()
    cy.get('.mcs-dots').click({ force: true })
    cy.contains('Create Lookalike').click()
    cy.contains('Partition based lookalike').click()
    cy.get('[id="name"]').type(faker.random.words(2))
    cy.get('[class="ant-slider"]').click()
    cy.get('[type="submit"]').click()
    cy.url().should('match', /.*segments\/[0-9]+/)
    // Wait for backend processing
    cy.wait(1500)
    cy.url().then(url => {
      const segmentId: number = parseInt(
        url.substring(url.indexOf('segments') + 9, url.length),
        10
      )
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/audience_segments/${segmentId}`,
        method: 'GET',
        headers: { Authorization: data.accessToken }
      }).then(responseSegment => {
        expect(responseSegment.body.data.type).to.eq('USER_LOOKALIKE')
      })
    })
  })
})

it('should create a user lookalike segment from user expert query segment', () => {
  cy.readFile('cypress/fixtures/init_infos.json').then(data => {
    cy.switchOrg(data.organisationName)
    cy.contains('Audience').click()
    cy.contains('Segments').click()
    cy.createSegmentFromUI('User Expert Query')
    cy.get('.mcs-dots').click({ force: true })
    cy.contains('Create Lookalike').click()
    cy.contains('Partition based lookalike').click()
    cy.get('[id="name"]').type(faker.random.words(2))
    cy.get('[class="ant-slider"]').click()
    cy.get('[type="submit"]').click()
    cy.url().should('match', /.*segments\/[0-9]+/)
    // Wait for backend processing
    cy.wait(1500)
    cy.url().then(url => {
      const segmentId: number = parseInt(
        url.substring(url.indexOf('segments') + 9, url.length),
        10
      )
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/audience_segments/${segmentId}`,
        method: 'GET',
        headers: { Authorization: data.accessToken }
      }).then(responseSegment => {
        expect(responseSegment.body.data.type).to.eq('USER_LOOKALIKE')
      })
    })
  })
})

it('should create a user lookalike segment from user query segment', () => {
  cy.readFile('cypress/fixtures/init_infos.json').then(data => {
    cy.switchOrg(data.organisationName)
    cy.contains('Audience').click()
    cy.contains('Segments').click()
    cy.createSegmentFromUI('User Query')
    cy.get('.mcs-dots').click({ force: true })
    cy.contains('Create Lookalike').click()
    cy.contains('Partition based lookalike').click()
    cy.get('[id="name"]').type(faker.random.words(2))
    cy.get('[class="ant-slider"]').click()
    cy.get('[type="submit"]').click()
    cy.url().should('match', /.*segments\/[0-9]+/)
    // Wait for backend processing
    cy.wait(1500)
    cy.url().then(url => {
      const segmentId: number = parseInt(
        url.substring(url.indexOf('segments') + 9, url.length),
        10
      )
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/audience_segments/${segmentId}`,
        method: 'GET',
        headers: { Authorization: data.accessToken }
      }).then(responseSegment => {
        expect(responseSegment.body.data.type).to.eq('USER_LOOKALIKE')
      })
    })
  })
})

// TODO Add a test where we calibrate the segment(We probably need to have user points on our datamart)