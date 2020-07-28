describe('This test should check that the audience segments forms are working properly', () => {
  beforeEach(() => {
    cy.login()
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName)
    })
  })

  it('Should create User List Segment', () => {
    cy.contains('Audience').click()
    cy.contains('Segments').click()
    cy.createSegmentFromUI('User List')
  })

  it('should create user pixel segment', () => {
    cy.contains('Audience').click()
    cy.contains('Segments').click({ force: true })
    cy.createSegmentFromUI('User Pixel')
  })

  it('should create user expert query segment', () => {
    cy.contains('Audience').click()
    cy.contains('Segments').click({ force: true })
    cy.createSegmentFromUI('User Expert Query')
  })
})
