describe('Check if Campaign auto set up Statistics are created', () => {
  const campaign_technical_name: string = 'campaign_auto_set_up';
  const ad_group_technical_name: string = 'ad_group_auto_set_up';
  const cache_buster_technical_name: string = 'cache_buster_auto_set_up';
  const creative_technical_name: string = 'ad_display_auto_set_up';

  before(() => {
    // Set platform settings campaign_auto_set_up
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.exec(
        `ssh -o StrictHostKeyChecking=no -l ${Cypress.env('userName')} ${Cypress.env(
          'virtualPlatformName',
        )}.mics-sandbox.com <<eof
        curl -k -H \'Authorization: ${
          data.accessToken
        }\' -H \'Content-Type: application/json\' -X POST https://10.0.1.3:8493/v1/platform_settings/campaign-automatic-setup.${
          data.datamartId
        }.is-automatic-setup-enabled -H "Host: admin-api.mediarithmics.local:8493"  \
        -d \'{"key":"campaign-automatic-setup.${
          data.datamartId
        }.is-automatic-setup-enabled", "value":"true"}\'`,
      )
        .its('stdout')
        .should('contain', '"value":"true"');

      // Set platform settings max-campaigns
      cy.exec(
        `ssh -o StrictHostKeyChecking=no -l ${Cypress.env('userName')} ${Cypress.env(
          'virtualPlatformName',
        )}.mics-sandbox.com <<eof
          curl -k -H \'Authorization: ${
            data.accessToken
          }\' -H \'Content-Type: application/json\' -X POST https://10.0.1.3:8493/v1/platform_settings/campaign-automatic-setup.${
          data.datamartId
        }.max-campaigns -H "Host: admin-api.mediarithmics.local:8493"  \
          -d \'{"key":"campaign-automatic-setup.${
            data.datamartId
          }.max-campaigns", "value":"100"}\'`,
      )
        .its('stdout')
        .should('contain', '"value":"100"');

      // Check if platform settings campaign_auto_set_up is set
      cy.exec(
        `ssh -o StrictHostKeyChecking=no -l ${Cypress.env('userName')} ${Cypress.env(
          'virtualPlatformName',
        )}.mics-sandbox.com <<eof
          curl -k -H \'Authorization: ${
            data.accessToken
          }\' -H \'Content-Type: application/json\' -X GET https://10.0.1.3:8493/v1/platform_settings/campaign-automatic-setup.${
          data.datamartId
        }.is-automatic-setup-enabled -H "Host: admin-api.mediarithmics.local:8493"`,
      )
        .its('stdout')
        .should('contain', '"value":"true"');

      // Send add_click event
      cy.request({
        url: `${Cypress.env(
          'eventDomain',
        )}/v1/touches/pixel?$email_hash=email_hash_click&$ev=$ad_click&$dat_token=${
          data.datamartToken
        }&$catn=${campaign_technical_name}&$scatn=${ad_group_technical_name}&$crtn=${creative_technical_name}&$cb=${cache_buster_technical_name}`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {},
      }).then(response => {
        expect(response.status).to.eq(200);
      });

      // Send add_click event
      cy.request({
        url: `${Cypress.env(
          'eventDomain',
        )}/v1/touches/pixel?$email_hash=email_hash_view&$ev=$ad_view&$dat_token=${
          data.datamartToken
        }&$catn=${campaign_technical_name}&$scatn=${ad_group_technical_name}&$crtn=${creative_technical_name}&$cb=${cache_buster_technical_name}`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {},
      }).then(response => {
        expect(response.status).to.eq(200);
      });
    });
  });

  beforeEach(() => {
    cy.login();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      // Switch organisation
      cy.switchOrg(data.organisationName);
    });
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Check if statistics views and clicks are displayed', () => {
    // Move to campaign page
    cy.get('.mcs-sideBar-subMenu_menu\\.campaign\\.title').click();
    cy.get('.mcs-sideBar-subMenuItem_menu\\.campaign\\.display').click();
    cy.get('.mcs-campaigns-link').contains(campaign_technical_name + '_auto_generated');

    // Check Click statistics number is equal to 1
    cy.get('.mcs-campaign-Display-view-stats').should('have.text', '1');

    // Check View statistics number is equal to 1
    cy.get('.mcs-campaign-Display-click-stats').should('have.text', '1');
  });
});
