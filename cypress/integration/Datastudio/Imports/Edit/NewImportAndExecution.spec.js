/// <reference types="Cypress" />
/// <reference path="../../../../support/index.d.ts" />

/*
    Cypress e2e Activities test 
*/

describe('New activities import and execution', function() {

    /*
            Define usefull Values 
    */
    const second = 1000;
    const organisationName = "yellow velvet";

    const datamartName = 'YV Pionus'

    before(() => {
        cy.viewport(1920, 1080)
        // Login
        cy.login()
        cy.url({timeout: 10*second}).should('contain', Cypress.config().baseUrl + '/#/v2/o/1/campaigns/display')
  
        // Switch organisation
        cy.switchOrg(organisationName)
      })

    beforeEach(() => {
      Cypress.Cookies.preserveOnce('access_token', 'access_token_expiration_date');
    })

    it('Generate import from files',function() { 

        //Go to data Studio menu
        cy.contains("Data Studio")
          .click();

        //Go to data Studio menu
        cy.contains("Imports")
          .click();

        //Create New Imports 
        cy.contains("New Import")
          .click();

        //Select the datamart
        cy.contains(datamartName)
          .click()

        //Fill the name
        cy.get('[id="name"]')
          .type("Test import Activities")

        //Select the right document type
        cy.get('[class="ant-select-selection__rendered"')
          .first()
          .click()

        cy.contains("User Activity")
          .click()

          /* 
          
          The rights setings are  when we load the pages, but it can be changed

        //Select the right Mime-type
        cy.get('[class="ant-select-selection__rendered"')
          .next('.selected')
          .click()

        cy.contains("New Line Delimited JSON")
          .click()

        //Select the right encoding
        cy.get('[class="ant-select-selection__rendered"')
          .last()
          .click()

        cy.contains("utf-8")
          .click()

        */

        //Save the import
        cy.get('[class="ant-btn mcs-primary ant-btn-primary"')
          .first()
          .click()

        //New execution
        cy.get('[class="ant-btn mcs-primary ant-btn-primary"')
          .first()
          .click()

    })

})
