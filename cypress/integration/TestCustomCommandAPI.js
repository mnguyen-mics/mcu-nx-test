/// <reference types="Cypress" />
/// <reference path="../support/index.d.ts" />

/*
    Cypress e2e Activities test 
*/

describe('Thib teste des trucs', function() {



    beforeEach(() => {
        Cypress.Cookies.preserveOnce('access_token', 'access_token_expiration_date');
      })
  
      it('Les commandes API Cypress',function() { 

        cy.visit('/')*

        cy.accessToken().should((response) => {
            expect(response.body).to.have.property('data')//test if it exist a data  in the bdy of the response --> use of assertion to analyse the response.
            expect(response.body.data).to.have.property('access_token') //How to go deeper in the response

           // token = response.body.data.accessToken
        })
        //.get(response.body.data.accessToken)

        //expect(token).to.not.eq(null)
      })
})

Cypress.Commands.add('accessToken', () => {
    cy.request({
        url: 'https://api.happy-cray.mics-sandbox.com/v1/authentication/access_tokens', //Bien sur à adapter en fonction de la vp
        method: 'POST',
        body: {

            "email":"dev@mediarithmics.com",
	        "password":"aoc"
        }

    })



})
