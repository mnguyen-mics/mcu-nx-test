describe('Timeline', () => {
    const second = 1000;

    beforeEach(() => {
      cy.viewport(1920, 1080)
      Cypress.Cookies.preserveOnce('access_token', 'access_token_expiration_date');
    })

    before(() => {
      // Login
      cy.login()
      cy.url({ timeout: 10 * second }).should("contain", Cypress.config().baseUrl +"/#/v2/o/1/campaigns/display");
      cy.visit(Cypress.config().baseUrl + '/#/v2/o/504/audience/timeline/user_point_id/01356aaa-b6fa-4d2c-9352-18e0e2fa8ccf?datamartId=1162')
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

