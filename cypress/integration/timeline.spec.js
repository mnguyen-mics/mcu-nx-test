describe('Timeline', () => {
    const second = 1000;

    beforeEach(() => {
      cy.viewport(1920, 1080)
      Cypress.Cookies.preserveOnce('access_token', 'access_token_expiration_date');
    })

    before(() => {
      // Login
      cy.login()
      cy.url({timeout: 10*second}).should('contain', Cypress.config().baseUrl + '/#/v2/o/1/campaigns/display')

      cy.visit(Cypress.config().baseUrl + '/#/v2/o/504/audience/timeline/user_point_id/01356aaa-b6fa-4d2c-9352-18e0e2fa8ccf?datamartId=1162')
    })

    it('Timeline should have 10 items', () => {
      cy.get('.content-title').contains("01356aaa-b6fa-4d2c-9352-18e0e2fa8ccf")
      cy.get('.ant-timeline-item').should('have.length', 10)
    })

    it('Should display more timeline items', () => {
      cy.get('.ant-timeline-item').last().find('.mcs-card-inner-action').as('see_more_button')
      cy.get('@see_more_button').should('have.text', 'See More').click()
      cy.wait(5*second)
      cy.get('.ant-timeline-item').should('have.length', 18).as('timeline_items')
      cy.get('.ant-timeline-item').last().find('.mcs-title').should('have.text', 'No Activities Left')
    })
  
    it('Should display json source modal', () => {
      cy.get('.ant-timeline-item').eq(1).find('.mcs-card-inner-action').first().as('view_json_source')
      cy.get('@view_json_source').should('have.text', 'View JSON source').click()
      cy.get('.ant-modal-content').should('be.visible') 
      cy.get('.ant-modal-confirm-title').should('have.text', 'Activity JSON')
      cy.get('.ant-modal-confirm-btns .ant-btn').should('have.text', 'Close').click()
      cy.get('.ant-modal-content').should('not.be.visible') 
    })

    it('Sould lookup userPoint by vectorId', () => {
      cy.get(':nth-child(2) > .ant-row > .table-right > .subtitle').then((element) => {
        const vectorId = element.text();
        cy.get('.mcs-actionbar .ant-btn').should('have.text', ' User Lookup').click()
        cy.get('.ant-modal-title').should('have.text', 'Enter the user identifier you want to lookup')
        cy.get('.ant-select-selection__rendered').click()
        cy.get('.ant-select-dropdown-menu-item:nth-child(3)').click()
        cy.get('.ant-modal-body .ant-input').type(vectorId)
        cy.get('.ant-modal-footer > .ant-btn-primary').click()
        cy.url({timeout: 10*second}).should('eq', Cypress.config().baseUrl + '/#/v2/o/504/audience/timeline/user_agent_id/vec:4083963529?datamartId=1162')
      })
    })

    it('Should lookup userpoint by emailHash', () => {
      //to improve with a better selector
      cy.get('#mcs-main-layout > div.ant-layout > div.ant-layout > div.ant-layout > div > div > div.ant-row.mcs-monitoring > div:nth-child(3) > div:nth-child(4) > div:nth-child(2) > div > div.ant-row.text-right > button > span').click()
      cy.get('#rcDialogTitle2').should('have.text', 'Email Information')
      cy.get('.table-line > :nth-child(5)').then((element) => {
        const emailHash = element.text();
        cy.get(':nth-child(21) > :nth-child(1) > .ant-modal-wrap > .ant-modal > .ant-modal-content > .ant-modal-footer > .ant-btn').click()
        cy.get('.mcs-actionbar .ant-btn').should('have.text', ' User Lookup').click()
        cy.get('.ant-modal-title').should('have.text', 'Enter the user identifier you want to lookup')
        cy.get('.ant-select-selection__rendered').click()
        cy.get('.ant-select-dropdown-menu-item:nth-child(4)').click()
        cy.get('.ant-modal-body .ant-input').clear().type(emailHash)
        cy.get('.ant-modal-footer > .ant-btn-primary').click()
        cy.url({timeout: 10*second}).should('eq', Cypress.config().baseUrl + '/#/v2/o/504/audience/timeline/email_hash/myhash?datamartId=1162')
      })
    })

  })

