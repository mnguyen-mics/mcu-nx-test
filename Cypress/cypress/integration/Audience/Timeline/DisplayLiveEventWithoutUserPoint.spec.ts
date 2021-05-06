describe.skip('A Live Event without user point related is correctly displayed on the timeline ', () => {
  before(() => {
    // Login
    cy.login();
    cy.url({ timeout: 10 * 1000 })
      .should('contain', Cypress.config().baseUrl + '/#/v2/o/1/campaigns/display')
      .then(() => {
        cy.request({
          method: 'post',
          url:
            Cypress.env('apiDomain') +
            '/v1/datamarts/1162/user_activities?processing_pipeline=true&async=false',
          body: {
            $type: 'SITE_VISIT',
            $session_status: 'IN_SESSION',
            $ttl: null,
            $email_hash: null,
            $origin: null,
            $location: null,
            $events: [
              {
                $ts: 1586964161517,
                $event_name: 'test',
                $properties: {
                  $url: 'https://www.mediarithmics.com',
                  $referrer: '',
                },
              },
            ],
            $error_analyzer_id: null,
            $user_agent_id: 'vec:10',
            $ts: 1586964161517,
            $session_duration: 0,
            $topics: {},
            $site_id: '2583',
          },
          headers: {
            authorization: localStorage.getItem('access_token'),
          },
        }).then(response => {
          expect(response.body).to.have.property('status', 'ok');
          // Even if we got 200 response, we have to wait a bit before user-activity-processing process the activity
          cy.wait(500);
          cy.visit(
            Cypress.config().baseUrl +
              '/#/v2/o/504/audience/timeline/user_agent_id/vec:10?datamartId=1162',
          );
        });
      });
  });
  it.skip('Should display json source modal', () => {
    cy.get('.ant-timeline-item')
      .eq(1)
      .find('.mcs-card-inner-action')
      .first()
      .as('view_json_source');
    cy.get('.ant-timeline-item')
      .eq(1)
      .find('.mcs-card-title')
      .first()
      .should('have.text', 'Site: mediarithmics');
    cy.get('@view_json_source').should('have.text', 'View JSON source').click();
    cy.get('.ant-modal-content').should('be.visible');
    cy.get('.ant-modal-confirm-title').should('have.text', 'Activity JSON');
    cy.get('.ant-modal-confirm-btns .ant-btn').should('have.text', 'Close').click();
    cy.get('.ant-modal-content').should('not.be.visible');
  });
});
