// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
import LoginPage from '../integration/Authentication/Login/LoginPage'

// -- This is a parent command --
Cypress.Commands.add(
  'login',
  (email = 'dev@mediarithmics.com', password = 'F&&DikfGd3$XDXDt7duL#KeVTn&5A#8za&Q5PrtiPC*BHkTbtg') => {
    const loginPage = new LoginPage()
    const baseUrl = Cypress.config().baseUrl
    // cy.server()
    loginPage.visit()
    cy.url().should('eq', baseUrl + '/#/login')

    loginPage.fillEmail(email)
    loginPage.fillPassword(password)

    loginPage.submit()
  },
)

Cypress.Commands.add('switchOrg', organisationName => {
  cy.get('.button-styleless')
    .first()
    .trigger('mouseover')
  cy.get('.button-styleless')
    .contains('Switch Org.')
    .click()
  cy.get('[placeholder="Search Organisation"]').type(organisationName)
  // cy.get('[placeholder="Search Organisation"]').invoke('val', 'yellow velve').trigger('change')
  // cy.get('[placeholder="Search Organisation"]').type('t')
  cy.get('.mcs-org-card')
    .should('have.length', 1)
    .click()
  cy.get('.button-styleless')
    .first()
    .trigger('mouseout')
})

// Storing local storage cache between tests
// https://blog.liplex.de/keep-local-storage-in-cypress/
const LOCAL_STORAGE_MEMORY: { [key: string]: any } = {}

Cypress.Commands.add('saveLocalStorageCache', () => {
  Object.keys(localStorage).forEach(key => {
    LOCAL_STORAGE_MEMORY[key] = localStorage[key]
  })
})

Cypress.Commands.add('restoreLocalStorageCache', () => {
  Object.keys(LOCAL_STORAGE_MEMORY).forEach(key => {
    localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key])
  })
})

//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
