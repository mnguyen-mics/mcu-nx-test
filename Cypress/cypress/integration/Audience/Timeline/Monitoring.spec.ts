import faker from 'faker';

describe('Timeline', () => {
  const second = 1000;
  const userAccountId = faker.random.number();
  const time = new Date();
  let userPointId: string;
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const address = faker.address.streetAddress();

  const goToMonitoring = () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      // Login
      cy.login();

      cy.url({ timeout: 10 * second }).should(
        'contain',
        Cypress.config().baseUrl + '/#/v2/o/1/campaigns/display',
      );
      cy.switchOrg(data.organisationName);

      // Go to Segment menu
      cy.contains('Audience').click();

      cy.contains('Monitoring').click();
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/compartments`,
        method: 'GET',
        headers: { Authorization: data.accessToken },
      }).then(compartmentResponse => {
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/datamarts/${
            data.datamartId
          }/user_identifiers/compartment_id=${
            compartmentResponse.body.data[0].compartment_id
          }/user_account_id=${userAccountId}`,
          method: 'GET',
          headers: { Authorization: data.accessToken },
        }).then(userLookupResponse => {
          cy.contains('User Lookup').click();
          cy.get('.ant-input').type(
            `${
              userLookupResponse.body.data[0].user_point_id
                ? userLookupResponse.body.data[0].user_point_id
                : userLookupResponse.body.data[1].user_point_id
            }`,
          );
          cy.contains('Submit').click();
        });
      });
    });
  };

  before(() => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/channels`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          name: 'test',
          domain: 'test.com',
          enable_analytics: false,
          type: 'MOBILE_APPLICATION',
        },
      }).then(channelResponse => {
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/datamarts/${
            data.datamartId
          }/user_activities?processing_pipeline=false`,
          method: 'POST',
          headers: { Authorization: data.accessToken },
          body: {
            $user_account_id: `${userAccountId}`,
            $type: 'APP_VISIT',
            $site_id: `${channelResponse.body.data.id}`,
            $session_status: 'NO_SESSION',
            $ts: time.getTime(),
            $events: [
              {
                $event_name: '$set_user_profile_properties',
                $ts: time.getTime(),
                $properties: {
                  $first_name: firstName,
                  $last_name: lastName,
                  $address: address,
                  $user_account_id: `${userAccountId}`,
                },
              },
            ],
          },
        }).then(() => {
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/compartments`,
            method: 'GET',
            headers: { Authorization: data.accessToken },
          }).then(compartmentResponse => {
            cy.request({
              url: `${Cypress.env('apiDomain')}/v1/datamarts/${
                data.datamartId
              }/user_identifiers/compartment_id=${
                compartmentResponse.body.data[0].compartment_id
              }/user_account_id=${userAccountId}`,
              method: 'GET',
              headers: { Authorization: data.accessToken },
            }).then(userLookupResponse => {
              userPointId = userLookupResponse.body.data[0].user_point_id
                ? userLookupResponse.body.data[0].user_point_id
                : userLookupResponse.body.data[1].user_point_id;
            });
          });
        });
      });
    });
  });

  beforeEach(() => {
    cy.restoreLocalStorageCache();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Check the existence cards', () => {
    goToMonitoring();
    cy.get('.mcs-contentHeader_title--large').should('have.text', userPointId);
    cy.get('.mcs-profileCard').should('be.visible');
    cy.get('.mcs-accountIdCard').should('be.visible');
    cy.get('.mcs-segmentCard').should('be.visible');
    cy.get('.mcs-device-card').should('be.visible');
    cy.get('.mcs-emailCard').should('be.visible');
    cy.get('.mcs-userChoicesCard').should('be.visible');
  });

  it('Check the content profile card', () => {
    goToMonitoring();
    cy.get('.mcs-profileCard').should('contain', `${userAccountId}`);
    cy.get('.mcs-profileCard').should('contain', firstName);
    cy.get('.mcs-profileCard').should('contain', lastName);
  });

  it('Check the content of user account id card', () => {
    goToMonitoring();
    cy.get('.mcs-accountIdCard').should('contain', `${userAccountId}`);
  });

  it('Check timeline', () => {
    goToMonitoring();
    cy.get('.mcs-activityCard').should('contain', '$set_user_profile_properties');
    cy.contains('Details').click();
    cy.get('.mcs-activityCard').should('contain', `${userAccountId}`);
    cy.get('.mcs-activityCard').should('contain', firstName);
    cy.get('.mcs-activityCard').should('contain', lastName);
    cy.get('.mcs-activityCard').should('contain', address);
  });

  it('Should display json source modal', () => {
    goToMonitoring();
    cy.get('.ant-timeline-item')
      .eq(1)
      .find('.mcs-card-inner-action')
      .first()
      .as('view_json_source');
    cy.get('@view_json_source').should('have.text', 'View JSON source').click();
    cy.get('.ant-modal-content').should('be.visible');
    cy.get('.ant-modal-confirm-title').should('have.text', 'Activity JSON');
    cy.get('.ant-modal-confirm-btns .ant-btn').should('have.text', 'Close').click();
    cy.get('.ant-modal-content').should('not.be.visible');
  });
});
