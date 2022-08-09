import faker from 'faker';
import SegmentsPage from '../../../pageobjects/Audience/SegmentsPage';

describe('UserList segment test', () => {
  beforeEach(() => {
    cy.login();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should test the UserList Forms', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const segmentsPage = new SegmentsPage();
      const segmentName: string = 'Test Audience Segment Form - Test User List Creation Form';
      const segmentDescription: string =
        'This segment was created to test the creation of segments.';
      const segmentTechName: string = faker.random.uuid();
      cy.switchOrg(data.organisationName);
      segmentsPage.goToPage();
      segmentsPage.clickBtnNewSegment();
      segmentsPage.clickUserList();
      segmentsPage.typeSegmentName(segmentName);
      segmentsPage.typeSegmentDescription(segmentDescription);
      segmentsPage.clickBtnAdvanced();
      segmentsPage.typeSegmentTechName(segmentTechName);
      segmentsPage.typeDefaultLifetime('1');
      segmentsPage.selectDayslifeTime();
      segmentsPage.clickBtnSaveNewSegment();
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
          segmentsPage.goToPage();
          segmentsPage.pickCreatedSegment(segmentName);
          segmentsPage.segmentNameInTable.first().click();
          segmentsPage.clickBtnEdit();
          segmentsPage.typeSegmentName(' -edited');
          segmentsPage.typeSegmentDescription(' -edited');
          segmentsPage.clickBtnAdvanced();
          segmentsPage.typeSegmentTechName(' -edited');
          segmentsPage.typeDefaultLifetime('2');
          segmentsPage.selectDayslifeTime();
          segmentsPage.clickBtnAdvanced();
          segmentsPage.clickBtnSaveNewSegment();
          cy.wait(5000);
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
