import Page from './Page';
import LeftMenu from './LeftMenu';

class CampaignsPage extends Page {
  constructor() {
    super();
  }

  goToPage() {
    LeftMenu.clickCampaignsMenu();
  }

  get btnNewCampaign() {
    return cy.get('.mcs-primary');
  }

  get btnExport() {
    return cy.get('.mcs-displayCampaigns_actionBar_export');
  }

  clickBtnNewCampaign() {
    this.btnNewCampaign.click();
  }

  clickBtnExport() {
    this.btnExport.click();
  }
}

export default CampaignsPage;
