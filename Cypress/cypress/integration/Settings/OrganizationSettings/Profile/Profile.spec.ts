import ActionbarObject from '../../../../pageobjects/HeaderMenu';
import ProfilePage from '../../../../pageobjects/Settings/Organisation/ProfilePage';

describe('Profile test', () => {
  beforeEach(() => {
    cy.restoreLocalStorageCache();
    cy.login();
    cy.visit('/');
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      ActionbarObject.switchOrg(data.organisationName);
    });
    new ProfilePage().goToPage();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should change the logo', () => {
    const profilePage = new ProfilePage();
    profilePage.logoZone.attachFile('cat.png', { subjectType: 'drag-n-drop' });
    cy.fixture('cat.png').should(content => {
      let fixtureImage = new Image();
      fixtureImage.src = `data:image/jpeg;base64,${content}`;
      profilePage.logoZone.get('img').should(([img]) => {
        expect(img.naturalWidth).to.equal(fixtureImage.naturalWidth);
        expect(img.naturalHeight).to.equal(fixtureImage.naturalHeight);
      });
    });
  });

  it('Organisation Name Field should contain current organisation name', () => {
    const profilePage = new ProfilePage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      profilePage.organisationNameField.should('contain', data.organisationName);
    });
  });

  //https://mediarithmics.atlassian.net/browse/MICS-13987
  it('Should display information about logo file', () => {
    const profilePage = new ProfilePage();
    profilePage.clickLogoInformationIcon();
    cy.contains('The logo file should be a PNG with a maximum size of 200kB.');
  });
});
