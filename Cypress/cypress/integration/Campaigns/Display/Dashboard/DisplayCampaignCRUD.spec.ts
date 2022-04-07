import faker from 'faker';
describe('The purpose of this test is to check if display campaign CRUD is properly working', () => {
  const second = 1000;
  const campaignName = '#bogoss ' + (Math.random() * 100).toFixed(0);
  const updatedCampaignName = campaignName + ' v2';
  const totalCapping = (Math.random() * 10).toFixed(0);
  const dailyCapping = (Math.random() * 2).toFixed(0);
  const totalBudget = (Math.random() * 10000).toFixed(0);
  const dailyBudget = (Math.random() * 500).toFixed(0);

  const goToDisplayCampaignScreen = () => {
    cy.get('.mcs-sideBar-subMenu_menu\\.campaign\\.title').click();
    cy.get('.mcs-sideBar-subMenuItem_menu\\.campaign\\.display').click();
  };

  beforeEach(() => {
    cy.login();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.switchOrg(data.organisationName);
    });
  });
  afterEach(() => {
    cy.clearLocalStorage();
  });
  it('Should create a display campaign', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      // Go to Campaigns > Display screen
      goToDisplayCampaignScreen();

      // Create campaign
      cy.get('.mcs-actionbar').contains('New Campaign').click();
      cy.contains('Programmatic').click();

      // Fill campaign creation form
      cy.get('.mcs-campaignDisplay_creationForm_campaign_name').type(campaignName);
      cy.get('.mcs-campaignDisplay_creationForm_campaign_total_impression_capping').type(
        totalCapping,
      );
      cy.get('.mcs-campaignDisplay_creationForm_campaign_per_day_impression_capping').type(
        dailyCapping,
      );
      cy.get('.mcs-campaignDisplay_creationForm_campaign_total_budget').type(totalBudget);
      cy.get('.mcs-campaignDisplay_creationForm_campaign_max_budget_per_period').type(dailyBudget);

      // Submit form
      cy.get('.mcs-form_saveButton_campaignForm').click();
      cy.wait(2 * second);

      // Go back to Campaigns > Display screen
      goToDisplayCampaignScreen();

      // Campaign should be visible
      cy.get('.ant-table-row-level-0').first().children().eq(2).should('contain', campaignName);

      // Click on newly created campaign
      cy.contains(campaignName).click();
      cy.get('.mcs-displayCampaign_actionBar_edit').click();

      // Assert if we have the same values
      cy.get('.mcs-campaignDisplay_creationForm_campaign_name').should('have.value', campaignName);
      cy.get('.mcs-campaignDisplay_creationForm_campaign_total_impression_capping').should(
        'have.value',
        totalCapping,
      );
      cy.get('.mcs-campaignDisplay_creationForm_campaign_per_day_impression_capping').should(
        'have.value',
        dailyCapping,
      );
      cy.get('.mcs-campaignDisplay_creationForm_campaign_total_budget')
        .children()
        .should('have.value', totalBudget);
      cy.get('.mcs-campaignDisplay_creationForm_campaign_max_budget_per_period')
        .find('input')
        .should('have.value', dailyBudget);

      // Update campaign name
      cy.get('.mcs-campaignDisplay_creationForm_campaign_name').clear().type(updatedCampaignName);

      // Submit form
      cy.get('.mcs-form_saveButton_campaignForm').click();
      cy.wait(2 * second);

      // Go back to Campaigns > Display screen
      goToDisplayCampaignScreen();

      // Updated campaign should be visible
      cy.get('.ant-table-row-level-0')
        .first()
        .children()
        .eq(2)
        .should('contain', updatedCampaignName);

      // Archive campaign
      cy.get('.mcs-table-container').find('.mcs-chevron').first().click();
      cy.contains('Archive').click();
      cy.contains('Archive now').click();
      cy.should('not.contain', updatedCampaignName);
    });
  });
});
