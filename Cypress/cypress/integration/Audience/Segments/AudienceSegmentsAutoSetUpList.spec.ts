describe('Check the segments clickers and exposed created by campaign auto setup', () => {
  const campaign_technical_name: string = 'campaign_auto_set_up';
  const ad_group_technical_name: string = 'ad_group_auto_set_up';
  const cache_buster_technical_name: string = 'cache_buster_auto_set_up';
  const creative_technical_name: string = 'ad_display_auto_set_up';
  const adclickSiteName: string = 'site_auto_set_up';
  const adviewSiteName: string = 'site_auto_set_up';
  const adclickuserAccountId = 'user_id_0';
  const adviewuserAccountId = 'user_id_1';
  const time = new Date();
  let adclickSegmentId: number;
  let adviewSegmentId: number;

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

      // Send add_view event
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

      // Wait the auto set up campaign creation
      cy.wait(30000);

      // Create one ad_click activity
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/display_campaigns?organisation_id=${
          data.organisationId
        }&keywords=${campaign_technical_name}`,
        method: 'GET',
        headers: { Authorization: data.accessToken },
      }).then(campaignResponse => {
        // Check if data is contains an id
        expect(campaignResponse.body.count).eq(1);
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/sites`,
          method: 'POST',
          headers: { Authorization: data.accessToken },
          body: {
            type: 'SITE',
            name: `${adclickSiteName}`,
            domain: 'test.com',
          },
        }).then(siteResponse => {
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/compartments`,
            method: 'GET',
            headers: { Authorization: data.accessToken },
          }).then(compartmentResponse => {
            cy.request({
              url: `${Cypress.env('apiDomain')}/v1/datamarts/${
                data.datamartId
              }/user_activities?processing_pipeline=false`,
              method: 'POST',
              headers: { Authorization: data.accessToken },
              body: {
                $user_account_id: `${adclickuserAccountId}`,
                $compartment_id: `${compartmentResponse.body.data[0].compartment_id}`,
                $type: 'DISPLAY_AD',
                $site_id: `${siteResponse.body.data.id}`,
                $session_status: 'NO_SESSION',
                $ts: time.getTime(),
                $events: [
                  {
                    $ts: time.getTime(),
                    $event_name: '$ad_click',
                  },
                ],
                $origin: { $campaign_id: `${campaignResponse.body.data[0].id}` },
              },
            }).then(activityResponse => {
              expect(activityResponse.body.status).eq('ok');
            });
          });
        });
      });

      // Create one ad_view activity
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/display_campaigns?organisation_id=${
          data.organisationId
        }&keywords=${campaign_technical_name}`,
        method: 'GET',
        headers: { Authorization: data.accessToken },
      }).then(campaignResponse => {
        // Check if data is contains an id
        expect(campaignResponse.body.count).eq(1);
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/sites`,
          method: 'POST',
          headers: { Authorization: data.accessToken },
          body: {
            type: 'SITE',
            name: `${adviewSiteName}`,
            domain: 'test.com',
          },
        }).then(siteResponse => {
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/compartments`,
            method: 'GET',
            headers: { Authorization: data.accessToken },
          }).then(compartmentResponse => {
            cy.request({
              url: `${Cypress.env('apiDomain')}/v1/datamarts/${
                data.datamartId
              }/user_activities?processing_pipeline=false`,
              method: 'POST',
              headers: { Authorization: data.accessToken },
              body: {
                $user_account_id: `${adviewuserAccountId}`,
                $compartment_id: `${compartmentResponse.body.data[0].compartment_id}`,
                $type: 'DISPLAY_AD',
                $site_id: `${siteResponse.body.data.id}`,
                $session_status: 'NO_SESSION',
                $ts: time.getTime(),
                $events: [
                  {
                    $ts: time.getTime(),
                    $event_name: '$ad_view',
                  },
                ],
                $origin: { $campaign_id: `${campaignResponse.body.data[0].id}` },
              },
            }).then(activityResponse => {
              expect(activityResponse.body.status).eq('ok');
            });
          });
        });
      });

      // Force Segment Calculation for adclick segment
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/audience_segments?organisation_id=${
          data.organisationId
        }`,
        method: 'GET',
        headers: { Authorization: data.accessToken },
      }).then(segmentResponse => {
        adclickSegmentId = segmentResponse.body.data[0].id;
        cy.exec(
          `ssh -o StrictHostKeyChecking=no -l ${Cypress.env('userName')} ${Cypress.env(
            'virtualPlatformName',
          )}.mics-sandbox.com <<eof
              curl -k -H \'Authorization: ${
                data.accessToken
              }\' -H \'Content-Type: application/json\' -X POST https://10.0.1.3:8493/v1/job_definitions/43/job_execution -H "Host: admin-api.mediarithmics.local:8493"  \
              -d \'{"execution": {
                "parameters":null,
                "result":null,
                "error":null,
                "id":"1",
                "status":null,
                "creation_date":null,
                "start_date":null,
                "duration":null,
                "organisation_id": ${data.organisationId},
                "user_id":null,
                "debug":null,
                "num_tasks":null,
                "completed_tasks":null,
                "erroneous_tasks":null,
                "job_type":"FORCE_SEGMENT_CALCULATION"
              },
              "params": {
                "datamart_id":${data.datamartId},
                "segment_id":${adclickSegmentId},
                "max_upsert_count":10000000,
                "operation": "STAT"
               },
              "datafarm_key":"DF_EU_DEV",
              "schedule":null,
              "external_model_id":null,
              "external_model_name":null}\'`,
        )
          .its('stdout')
          .should('contain', '"status":"ok"');
      });

      // Force Segment Calculation for adview segment
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/audience_segments?organisation_id=${
          data.organisationId
        }`,
        method: 'GET',
        headers: { Authorization: data.accessToken },
      }).then(segmentResponse => {
        adviewSegmentId = segmentResponse.body.data[1].id;
        cy.exec(
          `ssh -o StrictHostKeyChecking=no -l ${Cypress.env('userName')} ${Cypress.env(
            'virtualPlatformName',
          )}.mics-sandbox.com <<eof
              curl -k -H \'Authorization: ${
                data.accessToken
              }\' -H \'Content-Type: application/json\' -X POST https://10.0.1.3:8493/v1/job_definitions/43/job_execution -H "Host: admin-api.mediarithmics.local:8493"  \
              -d \'{"execution": {
                "parameters":null,
                "result":null,
                "error":null,
                "id":"1",
                "status":null,
                "creation_date":null,
                "start_date":null,
                "duration":null,
                "organisation_id": ${data.organisationId},
                "user_id":null,
                "debug":null,
                "num_tasks":null,
                "completed_tasks":null,
                "erroneous_tasks":null,
                "job_type":"FORCE_SEGMENT_CALCULATION"
              },
              "params": {
                "datamart_id":${data.datamartId},
                "segment_id":${adviewSegmentId},
                "max_upsert_count":10000000,
                "operation": "STAT"
               },
              "datafarm_key":"DF_EU_DEV",
              "schedule":null,
              "external_model_id":null,
              "external_model_name":null}\'`,
        )
          .its('stdout')
          .should('contain', '"status":"ok"');
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

  it('Check if statistics user points clickers and exposed are displayed', () => {
    // Go in Audience Segment Page
    cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
    cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.segments').click();
    // Check if segment page has been updated
    cy.get('tr:nth-child(1) .mcs-audienceSegment_user_points').should('have.text', '1');
    cy.get('tr:nth-child(2) .mcs-audienceSegment_user_points').should('have.text', '1');
  });
});
