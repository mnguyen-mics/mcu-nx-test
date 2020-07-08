/// <reference types="Cypress" />
/// <reference path="../../../../support/index.d.ts" />

context('Display Campaign - Resource history', () => {
  const second = 1000;
  const organisationName = 'yellow velvet';
  const campaignName = '#bogoss ' + (Math.random()*100).toFixed(0);
  const adGroupName = campaignName + ' - ad group';
  

  before(() => {
    // Login
    cy.login()
    cy.url({timeout: 10*second}).should('contain', Cypress.config().baseUrl + '/#/v2/o/1/campaigns/display')

    // Switch organisation
    cy.switchOrg(organisationName)
  })

  it('Campaign history', () => {
    //Move to campaign page
    cy.get(".ant-menu-submenu").contains("Campaigns").click()
    cy.get(".ant-menu-item").contains("Display").click({force : true})

    // Create campaign
    cy.get('.mcs-actionbar').contains("New Campaign").click()
    cy.contains("Programmatic").click()


    cy.get('[id="campaign.name"]').type(campaignName) // or get '#campaign\.name'

    // Add ad group to the campaign
    cy.get('[id="adGroups"] .ant-btn').click()

    cy.get('.drawer .mcs-actionbar-edit button').click()
    
    cy.get('[id="adGroup.name"]').type(adGroupName + '{enter}')

    // Submit form
    cy.get('form').submit()
    // We could also do, for instance : cy.get('.mcs-actionbar-edit [type="submit"]').click()

    
    // The Elasticsearch index can take up to 30 seconds to refresh,so we might not see the data before this.
    // To be sure, we wait 30 seconds before opening the 'History' drawer.
    cy.wait(30*second);

    // Open history
    cy.get('.mcs-actionbar').find('.ant-dropdown-trigger').click()
    cy.get('.ant-dropdown-menu-item').contains('History').parent().click()
    
    // Check history
    cy.get('.ant-timeline-item').should('have.length', 4).as('timeline_items')
    cy.get('@timeline_items').first().should('have.text', 'Today')
    cy.get('@timeline_items').last().should('have.text', 'No Events Left')
    cy.get('@timeline_items').eq(-2).should('contain', 'dev  created the ').as('creation_card')

    cy.get('@creation_card').find('.mcs-card-inner-action').as('see_more_button')
    cy.get('@see_more_button').should('have.text', 'see more').click()
    cy.get('.mcs-breadcrumb-edit > :nth-child(1) > .ant-breadcrumb-link').should('have.text', 'Display Campaign History') // obtained by the selector playground

    cy.get('.value').last().should('have.text', campaignName)
      .siblings('.name').should('have.text', ' Campaign Name ');
    // tester le nb de champs modifiés
    cy.get('@see_more_button').should('have.text', 'see less').click()

  })


  // it('cmd-line authentication', () => {
    
  //   cy.request({
  //       method: 'POST',
  //       url: Cypress.env('apiDomain') + '/v1/authentication/refresh_tokens',
  //       body: {
  //         "email":"dev@mediarithmics.com",
  //         "password":"aoc"
  //       }
  //     }).then((response => {
  //       const ref_token = response.body.data.refresh_token;
  //       console.log(ref_token)
  //       cy.request({
  //         method: 'POST',
  //         url: Cypress.env('apiDomain') + '/v1/authentication/access_tokens',
  //         body: {
  //           refresh_token: ref_token
  //         }
  //       }).then((response => {
  //         const access_token = response.body.data.access_token;
  //         console.log(access_token)
  //         cy.setCookie('access_token', access_token, {domain: Cypress.env('navigatorDomain')})
  //         cy.setCookie('refresh_token', ref_token, {domain: Cypress.env('navigatorDomain')})
  //         cy.setCookie('access_token_expiraton_date', '1554828334776', {domain: Cypress.env('navigatorDomain')})
  //         cy.setCookie('refresh_token_expiraton_date', '1554828334776', {domain: Cypress.env('navigatorDomain')})
  //         cy.wait(10000)
  //         cy.visit('navigator.mediarithmics.local/#/v2/o/1/campaigns/display?currentPage=1&from=now-7d&pageSize=10&to=now')
  //       }))
  //     }))
    

  // })
})

