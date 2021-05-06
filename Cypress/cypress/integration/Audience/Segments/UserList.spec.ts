import faker from 'faker';
describe('UserList segment test', () => {
  before(() => {
    cy.login();
  });
  beforeEach(() => {
    cy.restoreLocalStorageCache();
  });

  afterEach(() => {
    cy.saveLocalStorageCache();
  });

  it('Should test the UserList Forms', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const segmentName: string = 'Test Audience Segment Form - Test User List Creation Form';
      const segmentDescription: string =
        'This segment was created to test the creation of segments.';
      const segmentTechName: string = faker.random.uuid();
      cy.switchOrg(data.organisationName);
      // Go to Segment menu
      cy.contains('Audience').click();
      cy.contains('Segments').click();
      // Click on "new Segment"
      cy.contains('New Segment').click({ force: true });
      // Select Segment Types
      cy.contains('User List').click();
      // Fill the name of the segement
      cy.get('[id="audienceSegment.name"]').type(segmentName);
      // Fill the descritpion
      cy.get('[id="audienceSegment.short_description"]').type(segmentDescription);
      // click on advanced
      cy.get('[class="mcs-button optional-section-title"]').click();
      // Fill the technical name
      cy.get('[id="audienceSegment.technical_name"]').type(segmentTechName);
      // Fill the default life time
      cy.get('[id="defaultLifetime"]').type('1');
      // Choose day as the lifetime
      cy.get('[class ="mcs-addonSelect"]').click();
      cy.contains('Days').click();
      // Save the new segment
      cy.contains('Save').click({ force: true });
      // Extract the id
      cy.url().should('match', /.*segments\/[0-9]+/);
      cy.url().then(url => {
        const segmentId: number = parseInt(
          url.substring(url.indexOf('segments') + 9, url.length),
          10,
        );
        // Check that it's been added correctly
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/audience_segments/${segmentId}`,
          method: 'GET',
          headers: { Authorization: data.accessToken },
        }).then(responseAdd => {
          expect(responseAdd.body.data.datamart_id).to.eq(data.datamartId.toString());
          expect(responseAdd.body.data.organisation_id).to.eq(data.organisationId.toString());
          expect(responseAdd.body.data.short_description).to.eq(segmentDescription);
          expect(responseAdd.body.data.name).to.eq(segmentName);
          expect(responseAdd.body.data.technical_name).to.eq(segmentTechName);
          expect(responseAdd.body.data.type).to.eq('USER_LIST');
          expect(responseAdd.body.data.subtype).to.eq('STANDARD');
          expect(responseAdd.body.data.default_ttl).to.eq(1 * 24 * 60 * 60 * 1000);
          // Edit segment
          cy.contains('Segments').click();
          cy.get('[placeholder="Search Segments"]').type(segmentName).type('{enter}');
          cy.get('.mcs-campaigns-link').first().click();
          cy.get('.mcs-actionbar').contains('Edit').click({ force: true });
          cy.get('[id="audienceSegment.name"]').type(' -edited');
          // Fill the descritpion
          cy.get('[id="audienceSegment.short_description"]').type(' -edited');
          // click on advanced
          cy.get('[class="mcs-button optional-section-title"]').click();
          // Fill the technical name
          cy.get('[id="audienceSegment.technical_name"]').type(' -edited');
          // Fill the default life time
          cy.get('[id="defaultLifetime"]').type('2');
          // Choose day as the lifetime
          cy.get('[class ="mcs-addonSelect"]').click();
          cy.contains('Days').click();
          // click on advanced
          cy.get('[class="mcs-button optional-section-title"]').click();
          // Save the new segment
          cy.contains('Save').click({ force: true });
          cy.wait(2000);
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/audience_segments/${segmentId}`,
            method: 'GET',
            headers: { Authorization: data.accessToken },
          }).then(responseEdit => {
            expect(responseEdit.body.data.datamart_id).to.eq(data.datamartId.toString());
            expect(responseEdit.body.data.organisation_id).to.eq(data.organisationId.toString());
            expect(responseEdit.body.data.short_description).to.eq(segmentDescription + ' -edited');
            expect(responseEdit.body.data.name).to.eq(segmentName + ' -edited');
            expect(responseEdit.body.data.technical_name).to.eq(segmentTechName + ' -edited');
            expect(responseEdit.body.data.type).to.eq('USER_LIST');
            expect(responseEdit.body.data.subtype).to.eq('STANDARD');
            expect(responseEdit.body.data.default_ttl).to.eq(12 * 24 * 60 * 60 * 1000);
          });
        });
      });
    });
  });
});
