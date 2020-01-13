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
import LoginPage from "../integration/Authentication/Login/LoginPage";
// -- This is a parent command --
Cypress.Commands.add('login', (email = 'dev@mediarithmics.com', password = 'F&&DikfGd3$XDXDt7duL#KeVTn&5A#8za&Q5PrtiPC*BHkTbtg') => {
  const loginPage = new LoginPage();
  loginPage.visit();
  cy.url().should('eq', Cypress.config().baseUrl + '/#/login');

  loginPage.fillEmail(email);
  loginPage.fillPassword(password);

  loginPage.submit()
});

Cypress.Commands.add('switchOrg', (organisationName) => {
  cy.get('.button-styleless').first().trigger('mouseover')
  cy.get('.button-styleless').contains('Switch Org.').click()
  cy.get('[placeholder="Search Organisation"]').type(organisationName)
  cy.get('.mcs-org-card').should('have.length', 1).click()
  cy.get('.button-styleless').first().trigger('mouseout')
});

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
