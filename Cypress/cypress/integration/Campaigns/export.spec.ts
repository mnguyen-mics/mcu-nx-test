import CampaignsPage from '../../pageobjects/CampaignsPage';

describe('Campaigns - Export', () => {
  before(() => {
    // Login
    cy.login();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
    });
  });

  it('Check that export button works', () => {
    const campaignsPage = new CampaignsPage();
    campaignsPage.goToPage();
    campaignsPage.clickBtnExport();
  });
});
