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
    cy.wait(3000);

    cy.fixture('cat.png').then(content => {
      let fixtureImage = new Image();
      fixtureImage.src = `data:image/jpeg;base64,${content}`;
      fixtureImage.onload = () => {
        profilePage.logoZone.get('img').should(([img]) => {
          expect(img.naturalWidth).to.equal(fixtureImage.naturalWidth);
          expect(img.naturalHeight).to.equal(fixtureImage.naturalHeight);
        });
      };
    });
  });

  it('Organisation Name Field should be disabled', () => {
    const profilePage = new ProfilePage();

    profilePage.organisationNameField.should('be.disabled');
  });

  it('Should display information about logo file', () => {
    const profilePage = new ProfilePage();

    profilePage.clickLogoInformationIcon();
    cy.contains('The logo file should be a PNG with a maximum size of 200kB.');
  });
});
