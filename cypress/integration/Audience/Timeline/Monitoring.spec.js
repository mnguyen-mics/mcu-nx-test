/// <reference types="Cypress" />
/// <reference path="../../../support/index.d.ts" />

describe('Timeline', () => {
    const second = 1000;

    const organisationName = "yellow velvet";
    const datamartName = "YV Pionus";


    beforeEach(() => {
      Cypress.Cookies.preserveOnce('access_token', 'access_token_expiration_date');
    })

    before(() => {
      // Login
      cy.login()
      cy.url({ timeout: 10 * second }).should("contain", Cypress.config().baseUrl +"/#/v2/o/1/campaigns/display");

      cy.switchOrg(organisationName);

      //Go to Segment menu
      cy.contains("Audience").click();

      cy.contains("Monitoring").click();

      cy.contains(datamartName).click();

      cy.contains('User Lookup').click();
      cy.get('.ant-input').type("01356aaa-b6fa-4d2c-9352-18e0e2fa8ccf");
      cy.contains('Submit').click();
    })
  
    it('Should display json source modal', () => {
      cy.get('.ant-timeline-item').eq(1).find('.mcs-card-inner-action').first().as('view_json_source')
      cy.get('@view_json_source').should('have.text', 'View JSON source').click()
      cy.get('.ant-modal-content').should('be.visible') 
      cy.get('.ant-modal-confirm-title').should('have.text', 'Activity JSON')
      cy.get('.ant-modal-confirm-btns .ant-btn').should('have.text', 'Close').click()
      cy.get('.ant-modal-content').should('not.be.visible') 
    })

  })

