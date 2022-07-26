import Page from '../Page';
import LeftMenu from '../LeftMenu';
import { logFunction, logGetter } from '../log/LoggingDecorator';

class GoalsPage extends Page {
  constructor() {
    super();
  }

  @logFunction()
  goToPage() {
    LeftMenu.clickCampaignsMenu();
    LeftMenu.clickCampaignsGoals();
  }

  @logGetter()
  get goalTypeSelector() {
    return cy.get('.mcs-goalTriggerTypeSelector');
  }

  @logFunction()
  clickBtnNewGoals() {
    cy.get('.mcs-goalsActionBar_newGoalsButton').click();
  }
}

export default GoalsPage;
