import faker from 'faker';
describe('User Processing on segments tests', () => {
  before(() => {
    cy.login();
  });
  beforeEach(() => {
    cy.restoreLocalStorageCache();
  });

  afterEach(() => {
    cy.saveLocalStorageCache();
  });

  it('should create User Query segments with processing selections and edit it', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      // Create processing
      cy.switchOrg(data.organisationName);
      cy.get('[class="mcs-options"]').click();
      cy.contains('Organisation').click();
      cy.get(`[href="#/v2/o/${data.organisationId}/settings/organisation/processings"]`).click();
      cy.contains('New Data Processing').click();
      cy.contains('Consent').click();
      cy.get('[id="name"]').type('Processing Consent For Testing Purposes');
      cy.get('[id="purpose"]').type('Processing Consent For Testing Purposes');
      cy.contains('Advanced').click();
      cy.get('[id="technical_name"]').type(faker.lorem.word());
      cy.get('[type="submit"]').contains('Save').click({ force: true });
      cy.get('.anticon.anticon-appstore.menu-icon').click({ force: true });
      cy.contains('Audience').click();
      cy.contains('Segments').click();
      // Click on "new Segment"
      cy.contains('New Segment').click();
      // Select Segment Types
      cy.contains('User Query').click();
      // Fill the name of the segement
      cy.get('[id="audienceSegment.name"]').type(faker.random.words(3));
      // Fill the descritpion
      cy.get('[id="audienceSegment.short_description"]').type(faker.random.words(3));
      // click on advanced
      cy.get('[class="mcs-button optional-section-title"]').click();
      // Fill the technical name
      cy.get('[id="audienceSegment.technical_name"]').type(faker.lorem.word());
      // Fill the default life time
      cy.get('[id="defaultLifetime"]').type('1');
      // Choose day as the lifetime
      cy.get('[class ="mcs-addonSelect"]').click();
      cy.contains('Days').click();
      cy.get('.ant-btn.ant-dropdown-trigger').click();
      cy.contains('Add Processing Activity').click();
      cy.contains('Processing Consent For Testing Purposes').click();
      cy.contains('Add').click();
      cy.contains('Edit Query').click();
      cy.contains('Update').click();
      cy.contains('Save').click();
      // Wait for backend addition
      cy.wait(5000);
      cy.contains('Edit').click();
      cy.get('.mcs-delete').click();
      cy.contains('Yes').click();
      cy.contains('Save').click();
      cy.contains('OK').click();
      cy.url().should('match', /.*segments\/[0-9]+/);
      cy.url().then(url => {
        const segmentId: number = parseInt(
          url.substring(url.indexOf('segments') + 9, url.length),
          10,
        );
        // Wait for the backend update
        cy.wait(2000);
        // Check that it's been deleted
        cy.request({
          url: `${Cypress.env(
            'apiDomain',
          )}/v1/audience_segments/${segmentId}/processing_selections`,
          method: 'GET',
          headers: { Authorization: data.accessToken },
        }).then(responseSegment => {
          expect(responseSegment.body.data.length).to.eq(0);
        });
      });
    });
  });

  it('should create User List segment with processing selection and edit it', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.goToHome(data.organisationId);
      cy.contains('Audience').click();
      cy.contains('Segments').click();
      // Click on "new Segment"
      cy.contains('New Segment').click();
      // Select Segment Types
      cy.contains('User List').click();
      // Fill the name of the segement
      cy.get('[id="audienceSegment.name"]').type(faker.random.words(3));
      // Fill the descritpion
      cy.get('[id="audienceSegment.short_description"]').type(faker.random.words(3));
      // click on advanced
      cy.get('[class="mcs-button optional-section-title"]').click();
      // Fill the technical name
      cy.get('[id="audienceSegment.technical_name"]').type(faker.lorem.word());
      // Fill the default life time
      cy.get('[id="defaultLifetime"]').type('1');
      // Choose day as the lifetime
      cy.get('[class ="mcs-addonSelect"]').click();
      cy.contains('Days').click();
      cy.get('.ant-btn.ant-dropdown-trigger').click();
      cy.contains('Add Processing Activity').click();
      cy.contains('Processing Consent For Testing Purposes').click();
      cy.contains('Add').click();
      cy.contains('Save').click();
      // Wait for backend addition
      cy.wait(2000);
      cy.contains('Edit').click();
      cy.get('.mcs-delete').click();
      cy.contains('Yes').click();
      cy.contains('Save').click();
      cy.contains('OK').click();
      cy.url().should('match', /.*segments\/[0-9]+/);
      cy.url().then(url => {
        const segmentId: number = parseInt(
          url.substring(url.indexOf('segments') + 9, url.length),
          10,
        );
        // Wait for the backend update
        cy.wait(2000);
        // Check that it's been deleted
        cy.request({
          url: `${Cypress.env(
            'apiDomain',
          )}/v1/audience_segments/${segmentId}/processing_selections`,
          method: 'GET',
          headers: { Authorization: data.accessToken },
        }).then(responseSegment => {
          expect(responseSegment.body.data.length).to.eq(0);
        });
      });
    });
  });

  it('should create User Pixel segment with processing selection and edit it', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.goToHome(data.organisationId);
      cy.contains('Audience').click();
      cy.contains('Segments').click();
      // Click on "new Segment"
      cy.contains('New Segment').click();
      // Select Segment Types
      cy.contains('User Pixel').click();
      // Fill the name of the segement
      cy.get('[id="audienceSegment.name"]').type(faker.random.words(3));
      // Fill the descritpion
      cy.get('[id="audienceSegment.short_description"]').type(faker.random.words(3));
      // click on advanced
      cy.get('[class="mcs-button optional-section-title"]').click();
      // Fill the technical name
      cy.get('[id="audienceSegment.technical_name"]').type(faker.lorem.word());
      // Fill the default life time
      cy.get('[id="defaultLifetime"]').type('1');
      // Choose day as the lifetime
      cy.get('[class ="mcs-addonSelect"]').click();
      cy.contains('Days').click();
      cy.get('.ant-btn.ant-dropdown-trigger').click();
      cy.contains('Add Processing Activity').click();
      cy.contains('Processing Consent For Testing Purposes').click();
      cy.contains('Add').click();
      cy.contains('Save').click();
      cy.contains('Save').click();
      // Wait for backend addition
      cy.wait(2000);
      cy.contains('Edit').click();
      cy.get('.mcs-delete').click();
      cy.contains('Yes').click();
      cy.contains('Save').click();
      cy.contains('OK').click();
      cy.url().should('match', /.*segments\/[0-9]+/);
      cy.url().then(url => {
        const segmentId: number = parseInt(
          url.substring(url.indexOf('segments') + 9, url.length),
          10,
        );
        // Wait for the backend update
        cy.wait(2000);
        // Check that it's been deleted
        cy.request({
          url: `${Cypress.env(
            'apiDomain',
          )}/v1/audience_segments/${segmentId}/processing_selections`,
          method: 'GET',
          headers: { Authorization: data.accessToken },
        }).then(responseSegment => {
          expect(responseSegment.body.data.length).to.eq(0);
        });
      });
    });
  });

  it('should create User Expert Query segment with processing selection and edit it', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.goToHome(data.organisationId);
      cy.contains('Audience').click();
      cy.contains('Segments').click();
      // Click on "new Segment"
      cy.contains('New Segment').click();
      // Select Segment Types
      cy.contains('User Expert Query').click();
      // Fill the name of the segement
      cy.get('[id="audienceSegment.name"]').type(faker.random.words(3));
      // Fill the descritpion
      cy.get('[id="audienceSegment.short_description"]').type(faker.random.words(3));
      // click on advanced
      cy.get('[class="mcs-button optional-section-title"]').click();
      // Fill the technical name
      cy.get('[id="audienceSegment.technical_name"]').type(faker.lorem.word());
      // Fill the default life time
      cy.get('[id="defaultLifetime"]').type('1');
      // Choose day as the lifetime
      cy.get('[class ="mcs-addonSelect"]').click();
      cy.contains('Days').click();
      cy.get('.ant-btn.ant-dropdown-trigger').click();
      cy.contains('Add Processing Activity').click();
      cy.contains('Processing Consent For Testing Purposes').click();
      cy.contains('Add').click();
      cy.get('[id="brace-editor"]')
        .find('[class="ace_text-input"]')
        .type(`SELECT {id} FROM UserPoint WHERE creation_date <= "now-120d/d"`, {
          force: true,
          parseSpecialCharSequences: false,
        });
      cy.contains('Save').click();
      // Wait for backend addition
      cy.wait(2000);
      cy.contains('Edit').click();
      cy.get('.mcs-delete').click();
      cy.contains('Yes').click();
      cy.contains('Save').click();
      cy.contains('OK').click();
      cy.url().should('match', /.*segments\/[0-9]+/);
      cy.url().then(url => {
        const segmentId: number = parseInt(
          url.substring(url.indexOf('segments') + 9, url.length),
          10,
        );
        // Wait for the backend update
        cy.wait(2000);
        // Check that it's been deleted
        cy.request({
          url: `${Cypress.env(
            'apiDomain',
          )}/v1/audience_segments/${segmentId}/processing_selections`,
          method: 'GET',
          headers: { Authorization: data.accessToken },
        }).then(responseSegment => {
          expect(responseSegment.body.data.length).to.eq(0);
        });
      });
    });
  });

  it('should check that processing decorators are not activated for edge segments', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.goToHome(data.organisationId);
      cy.contains('Audience').click();
      cy.contains('Segments').click();
      // Click on "new Segment"
      cy.contains('New Segment').click();
      // Select Segment Types
      cy.contains('Edge').click();
      cy.get('.empty-related-records').should(
        'contain',
        'This feature is not available for Edge segments.',
      );
    });
  });

  it('should test the processing decorators through advanced segment builder', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.goToHome(data.organisationId);
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/processings`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          community_id: data.organisationId,
          legal_basis: 'CONSENT',
          name: 'test_segment_builder_user_query',
          purpose: 'test_segment_builder_user_query',
        },
      }).then(() => {
        cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
        cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.builder').click();
        cy.get('.mcs-advancedSegmentBuilder').click();
        cy.get('.mcs-saveQueryAsActionBar_button').click();
        cy.get('.mcs-saveQueryAsActionBar_menu_userQuery').click();
        cy.get('.mcs-newUserQuerySegmentSimpleForm_name_input').type('test');
        cy.get('.mcs-processingActivitiesFormSection_modalSearchBar').click();
        cy.contains('test_segment_builder_user_query').click();
        cy.get('.mcs-saveAsUserQuerySegmentModal_ok_button').click();
        cy.url().should('match', /.*segments\/[0-9]+/);
        cy.url().then(url => {
          const segmentId: number = parseInt(
            url.substring(url.indexOf('segments') + 9, url.length),
            10,
          );
          // Wait for the backend update
          cy.wait(5000);
          // Check that it's been deleted
          cy.request({
            url: `${Cypress.env(
              'apiDomain',
            )}/v1/audience_segments/${segmentId}/processing_selections`,
            method: 'GET',
            headers: { Authorization: data.accessToken },
          }).then(responseSegment => {
            expect(responseSegment.body.data.length).to.eq(1);
          });
        });
      });
    });
  });
});
