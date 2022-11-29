import faker from 'faker';
describe('Segments lookalike tests', () => {
  beforeEach(() => {
    cy.login();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
    });
  });

  const deleteSegment = (segmentName: string) => {
    cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.segments').click();
    cy.get('.mcs-audienceSegmentTable_dropDownMenu').first().click();
    cy.get('.mcs-audienceSegmentTable_dropDownMenu--delete').click();
    cy
      .get('.mcs-audienceSegmentDeletePopup')
      .should('contain', 'You are about to definitively delete this segment : ' + segmentName),
      cy.get('.mcs-audienceSegmentDeletePopup_ok_button').click();
    cy.get('.mcs-audienceSegmentTable').should('not.contain', segmentName);
  };

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('should create a user lookalike segment from user list segment and edit it', () => {
    const segmentDescription = faker.random.words(3);
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.segments').click();
      cy.createSegmentFromUI('User List');
      cy.get('.mcs-dots').click({ force: true });
      cy.get('.mcs-menu-antd-customized_item--lookalike').click();
      cy.get('.mcs-menu-list').first().click();
      const segmentLookalikeName = faker.random.words(2);
      cy.get('.mcs-audienceLookAlikeCreation_segmentName').type(segmentLookalikeName);
      cy.get('.mcs-formSlider').click();
      cy.get('.mcs-form_saveButton_lookalikeForm').click();
      cy.url().should('match', /.*segments\/[0-9]+/);
      // Wait for backend processing
      cy.wait(1500);
      cy.url().then(url => {
        const segmentId: number = parseInt(
          url.substring(url.indexOf('segments') + 9, url.length),
          10,
        );
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/audience_segments/${segmentId}`,
          method: 'GET',
          headers: { Authorization: data.accessToken },
        }).then(responseSegment => {
          expect(responseSegment.body.data.type).to.eq('USER_LOOKALIKE');
          cy.get('.mcs-pen').click({ force: true });
          cy.get('.mcs-generalFormSection_description').type(segmentDescription);
          cy.get('.mcs-form-container').find('.mcs-button').click();
          cy.get('.mcs-generalFormSection_defaultLifeTime').type('{selectall}{backspace}1');
          cy.get('.mcs-form_saveButton_audienceSegmentForm').click();
          cy.url().should('match', /.*segments\/[0-9]+/);
          // Wait for backend processing
          cy.wait(1500);
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/audience_segments/${segmentId}`,
            method: 'GET',
            headers: { Authorization: data.accessToken },
          }).then(responseSegmentUpdated => {
            expect(responseSegmentUpdated.body.data.type).to.eq('USER_LOOKALIKE');
            expect(responseSegmentUpdated.body.data.short_description).to.eq(segmentDescription);
            expect(responseSegmentUpdated.body.data.default_ttl).to.eq(1 * 24 * 60 * 60 * 1000);
          });
        });
      });
      deleteSegment(segmentLookalikeName);
    });
  });

  it('should create a user lookalike segment from user pixel segment', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.segments').click();
      cy.createSegmentFromUI('User Pixel');
      cy.get('.mcs-form_saveButton_audienceSegmentForm').click();
      cy.get('.mcs-dots').click({ force: true });
      cy.get('.mcs-menu-antd-customized_item--lookalike').click();
      cy.get('.mcs-menu-list').first().click();
      const segmentLookalikeName = faker.random.words(2);
      cy.get('.mcs-audienceLookAlikeCreation_segmentName').type(segmentLookalikeName);
      cy.get('.mcs-formSlider').click();
      cy.get('.mcs-form_saveButton_lookalikeForm').click();
      cy.url().should('match', /.*segments\/[0-9]+/);
      // Wait for backend processing
      cy.wait(1500);
      cy.url().then(url => {
        const segmentId: number = parseInt(
          url.substring(url.indexOf('segments') + 9, url.length),
          10,
        );
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/audience_segments/${segmentId}`,
          method: 'GET',
          headers: { Authorization: data.accessToken },
        }).then(responseSegment => {
          expect(responseSegment.body.data.type).to.eq('USER_LOOKALIKE');
        });
      });
      deleteSegment(segmentLookalikeName);
    });
  });

  it('should create a user lookalike segment from user expert query segment', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.segments').click();
      cy.createSegmentFromUI('User Expert Query');
      cy.get('.mcs-dots').click({ force: true });
      cy.get('.mcs-menu-antd-customized_item--lookalike').click();
      cy.get('.mcs-menu-list').first().click();
      const segmentLookalikeName = faker.random.words(2);
      cy.get('.mcs-audienceLookAlikeCreation_segmentName').type(segmentLookalikeName);
      cy.get('.mcs-formSlider').click();
      cy.get('.mcs-form_saveButton_lookalikeForm').click();
      cy.url().should('match', /.*segments\/[0-9]+/);
      // Wait for backend processing
      cy.wait(1500);
      cy.url().then(url => {
        const segmentId: number = parseInt(
          url.substring(url.indexOf('segments') + 9, url.length),
          10,
        );
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/audience_segments/${segmentId}`,
          method: 'GET',
          headers: { Authorization: data.accessToken },
        }).then(responseSegment => {
          expect(responseSegment.body.data.type).to.eq('USER_LOOKALIKE');
        });
      });
      deleteSegment(segmentLookalikeName);
    });
  });

  it('should create a user lookalike segment from user query segment', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.title').click();
      cy.get('.mcs-sideBar-subMenuItem_menu\\.audience\\.segments').click();
      cy.createSegmentFromUI('User Query');
      cy.get('.mcs-dots').click({ force: true });
      cy.get('.mcs-menu-antd-customized_item--lookalike').click();
      cy.get('.mcs-menu-list').first().click();
      const segmentLookalikeName = faker.random.words(2);
      cy.get('.mcs-audienceLookAlikeCreation_segmentName').type(segmentLookalikeName);
      cy.get('.mcs-formSlider').click();
      cy.get('.mcs-form_saveButton_lookalikeForm').click();
      cy.url().should('match', /.*segments\/[0-9]+/);
      // Wait for backend processing
      cy.wait(1500);
      cy.url().then(url => {
        const segmentId: number = parseInt(
          url.substring(url.indexOf('segments') + 9, url.length),
          10,
        );
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/audience_segments/${segmentId}`,
          method: 'GET',
          headers: { Authorization: data.accessToken },
        }).then(responseSegment => {
          expect(responseSegment.body.data.type).to.eq('USER_LOOKALIKE');
        });
      });
      deleteSegment(segmentLookalikeName);
    });
  });
  // TODO Add a test where we calibrate the segment(We probably need to have user points on our datamart)
});
