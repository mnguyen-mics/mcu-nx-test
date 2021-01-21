describe('Test Automations',()=>{
    before(() => {
      cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.setDataSetForAutomation(data.accessToken, data.datamartId, data.organisationId)
      cy.login()
      })
    })
    beforeEach(() => {
      cy.restoreLocalStorageCache()
    })
    
    afterEach(() => {
      cy.saveLocalStorageCache()
    })
    
    it('Should test the test function of an automation', () => {
      cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
        cy.switchOrg(data.organisationName)
        // Open automation
        cy.contains('Automations').click()
        cy.contains('List').click()
        cy.contains('React To Event for test Automation e2e').click()
        cy.contains('Test').click()
        cy.get('.mcs-content-container')
          .should('contain', 'Test your automation');
      })
    })
    
    })
    