before(() => {
  cy.login()
})

beforeEach(() => {
  cy.restoreLocalStorageCache()
})

afterEach(() => {
  cy.saveLocalStorageCache()
})

it('Should create User List / User Pixel / User Expert Query Segments', () => {
  cy.readFile('cypress/fixtures/init_infos.json').then(data => {
    cy.switchOrg(data.organisationName)
    cy.contains('Audience').click()
    cy.contains('Segments').click()
    cy.createSegmentFromUI('User List')
    cy.goToHome(data.organisationId)
    cy.contains('Audience').click()
    cy.contains('Segments').click({force:true})
    cy.createSegmentFromUI('User Pixel')
    cy.goToHome(data.organisationId)
    cy.contains('Audience').click()
    cy.contains('Segments').click({force:true})
    cy.createSegmentFromUI('User Expert Query')
  })
})
